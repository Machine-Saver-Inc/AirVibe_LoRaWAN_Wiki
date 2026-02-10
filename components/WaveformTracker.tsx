
import React, { useEffect, useMemo, useRef, useState } from 'react';

// --- Colors ---------------------------------------------------------------
const COL = {
  green: '#00bf63',
  red: '#ff5050',
  grey: '#b4b4b4',
  yellow: '#ffd21f',
  axis1: '#00357a',
  axis2: '#1f80ff',
  axis3: '#c2dcff',
};

// --- Helpers --------------------------------------------------------------
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s|0x/gi, '').toLowerCase();
  if (!/^[0-9a-f]*$/.test(clean)) throw new Error('Hex contains invalid characters');
  if (clean.length % 2 !== 0) throw new Error('Hex length must be even');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) out[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  return out;
}

function i16From(bytes: Uint8Array, start: number, count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    const off = start + i * 2;
    const v = (bytes[off] << 8) | bytes[off + 1];
    arr.push(v & 0x8000 ? v - 0x10000 : v);
  }
  return arr;
}

function axisMaskToText(mask: number): string {
  const axes: string[] = [];
  if (mask & 0x1) axes.push('Axis 1');
  if (mask & 0x2) axes.push('Axis 2');
  if (mask & 0x4) axes.push('Axis 3');
  return axes.length ? axes.join(', ') : 'None';
}

function filterCodeToText(code: number): string {
  if (code === 0x81) return 'Low-pass 2670 Hz';
  return `Code 0x${code.toString(16)}`;
}

// --- Packet types ---------------------------------------------------------
interface ParamsPacket {
  PacketType: 3;
  TransactionID: number;
  SegmentNumber: number;
  ErrorCode: number;
  AxisSelection: number;
  AxisSelectionText: string;
  NumberOfSegments: number;
  HardwareFilterCode: number;
  HardwareFilterText: string;
  SamplingRate_Hz: number;
  NumberOfSamplesEachAxis: number;
  LastSegment: false;
  _raw: Uint8Array;
}

interface DataPacket {
  PacketType: 1 | 5;
  TransactionID: number;
  SegmentNumber: number;
  LastSegment: boolean;
  Samples_i16: number[];
  Samples_Triplets_i16: number[][];
  _raw: Uint8Array;
}

type Packet = ParamsPacket | DataPacket;

function decodePacket(hex: string): Packet {
  const b = hexToBytes(hex);
  const type = b[0];
  const txId = b[1];
  const seg = (b[2] << 8) | b[3];

  if (type === 0x03) {
    return {
      PacketType: 3,
      TransactionID: txId,
      SegmentNumber: seg,
      ErrorCode: b[5],
      AxisSelection: b[4],
      AxisSelectionText: axisMaskToText(b[4]),
      NumberOfSegments: b[6],
      HardwareFilterCode: b[7],
      HardwareFilterText: filterCodeToText(b[7]),
      SamplingRate_Hz: (b[8] << 8) | b[9],
      NumberOfSamplesEachAxis: (b[10] << 8) | b[11],
      LastSegment: false,
      _raw: b,
    };
  }

  if (type === 0x01 || type === 0x05) {
    const sampleBytes = b.slice(4);
    if (sampleBytes.length % 2 !== 0) throw new Error('Sample payload length must be even');
    const n = sampleBytes.length / 2;
    const samples = i16From(sampleBytes, 0, n);
    const triplets: number[][] = [];
    for (let i = 0; i < samples.length; i += 3) {
      if (i + 2 < samples.length) triplets.push([samples[i], samples[i + 1], samples[i + 2]]);
    }
    return {
      PacketType: type as 1 | 5,
      TransactionID: txId,
      SegmentNumber: seg,
      LastSegment: type === 0x05,
      Samples_i16: samples,
      Samples_Triplets_i16: triplets,
      _raw: b,
    };
  }

  throw new Error(`Unsupported PacketType 0x${type.toString(16)}`);
}

// --- Assembler ------------------------------------------------------------
interface Downlink {
  label: string;
  port: number;
  hex: string;
}

interface Transaction {
  txId: number;
  params: ParamsPacket | null;
  expected: number | null;
  segments: Map<number, DataPacket>;
  axisMask: number;
  sr: number | null;
  samplesPerAxis: number | null;
  segSizes: number[] | null;
  sawDataBeforeParams: boolean;
  requestedMissing: boolean;
  downlinks: Downlink[];
  warnings: string[];
  saw05: boolean;
  missing: number[];
  maxSeen: number;
  complete: boolean;
}

type WaveState = Record<number, Transaction>;

function variance(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  let v = 0;
  for (const x of arr) { const d = x - mean; v += d * d; }
  return v / arr.length;
}

function inferAxisMaskFromData(pkt: DataPacket): { mask: number; reason: string } {
  const trip = pkt.Samples_Triplets_i16 || [];
  const triVar = trip.length ? [
    variance(trip.map(t => t?.[0] ?? 0)),
    variance(trip.map(t => t?.[1] ?? 0)),
    variance(trip.map(t => t?.[2] ?? 0)),
  ] : [0, 0, 0];
  const triActive = triVar.filter(v => v > 0).length;
  if (triActive >= 2) return { mask: 0x07, reason: 'AxisSelection=0; inferred tri-axial from triplet variance.' };
  const flat = pkt.Samples_i16 || [];
  const v1 = variance(flat);
  const order = [0x02, 0x01, 0x04];
  const chosen = v1 > 0 ? order[0] : order[1];
  return { mask: chosen, reason: 'AxisSelection=0; inferred single-axis and preferred Axis 2 by policy.' };
}

function initSegSizes(tx: Transaction): void {
  const isTri = tx.axisMask === 0x07;
  const cap = isTri ? 7 : 21;
  const sizes = new Array(tx.expected).fill(cap);
  if (tx.samplesPerAxis != null) {
    const rem = tx.samplesPerAxis % cap;
    if (rem !== 0) sizes[sizes.length - 1] = rem;
  }
  tx.segSizes = sizes;
}

function buildMissingHex(idxs: number[]): string {
  const s = idxs.map(x => x.toString(16).padStart(2, '0')).join('');
  return `02${s}`;
}

function assemble(prev: WaveState, pkt: Packet): WaveState {
  const tx: Transaction = prev[pkt.TransactionID] ?? {
    txId: pkt.TransactionID,
    params: null,
    expected: null,
    segments: new Map(),
    axisMask: 0,
    sr: null,
    samplesPerAxis: null,
    segSizes: null,
    sawDataBeforeParams: false,
    requestedMissing: false,
    downlinks: [],
    warnings: [],
    saw05: false,
    missing: [],
    maxSeen: -1,
    complete: false,
  };

  if (pkt.PacketType === 3) {
    tx.params = pkt as ParamsPacket;
    tx.expected = (pkt as ParamsPacket).NumberOfSegments;
    tx.axisMask = (pkt as ParamsPacket).AxisSelection;
    tx.sr = (pkt as ParamsPacket).SamplingRate_Hz;
    tx.samplesPerAxis = (pkt as ParamsPacket).NumberOfSamplesEachAxis;
    if ([0x07, 0x01, 0x02, 0x04].includes(tx.axisMask)) initSegSizes(tx);
    tx.downlinks = [
      { label: 'ACK Time Waveform Information Uplink', port: 20, hex: `03${pkt.TransactionID.toString(16).padStart(2, '0')}` },
    ];
  } else {
    const dataPkt = pkt as DataPacket;
    if (!tx.params) {
      tx.sawDataBeforeParams = true;
      tx.downlinks = [{ label: 'REQ Time Waveform Information Uplink', port: 22, hex: '0001' }];
    }

    if (![0x07, 0x01, 0x02, 0x04].includes(tx.axisMask)) {
      const inf = inferAxisMaskFromData(dataPkt);
      tx.axisMask = inf.mask;
      if (inf.reason) tx.warnings.push(inf.reason);
      if (!tx.segSizes && tx.samplesPerAxis != null) initSegSizes(tx);
    }

    const validSingle = (m: number) => m === 0x01 || m === 0x02 || m === 0x04;
    if (tx.axisMask !== 0x07 && !validSingle(tx.axisMask)) {
      tx.warnings.push(`Invalid AxisSelection 0x${(tx.axisMask || 0).toString(16)}`);
    }

    tx.segments.set(dataPkt.SegmentNumber, dataPkt);
    if (dataPkt.PacketType === 0x05) tx.saw05 = true;
  }

  const missing: number[] = [];
  let maxSeen = -1;
  if (tx.expected != null) {
    for (let i = 0; i < tx.expected; i++) if (tx.segments.has(i)) maxSeen = Math.max(maxSeen, i);
    for (let i = 0; i < tx.expected; i++) if (!tx.segments.has(i)) missing.push(i);
  }
  const complete = tx.expected != null && missing.length === 0 && tx.segments.size === tx.expected;

  if (pkt.PacketType === 0x05) {
    if (missing.length > 0) {
      tx.requestedMissing = true;
      tx.downlinks = [
        ...tx.downlinks,
        { label: `Request Missing Segments [${missing.join(', ')}]`, port: 22, hex: buildMissingHex(missing) },
      ];
    } else {
      tx.downlinks = [
        ...tx.downlinks,
        { label: 'Download assembled CSV', port: 0, hex: `export:${tx.txId}` },
        { label: 'ACK ALL', port: 20, hex: `01${tx.txId.toString(16).padStart(2, '0')}` },
      ];
    }
  }

  return { ...prev, [tx.txId]: { ...tx, missing, maxSeen, complete } };
}

// --- Segment state colors -------------------------------------------------
function segmentStates(tx: Transaction): string[] {
  if (!tx.expected) return [];
  const out = new Array(tx.expected).fill('grey');
  const have = new Set([...tx.segments.keys()]);
  const maxSeen = tx.maxSeen ?? -1;
  for (let i = 0; i <= maxSeen; i++) out[i] = have.has(i) ? 'green' : 'red';
  for (let i = maxSeen + 1; i < tx.expected; i++) out[i] = 'grey';
  if (tx.requestedMissing) {
    for (const i of tx.missing || []) if (!have.has(i)) out[i] = 'yellow';
  }
  return out;
}

// --- Waveform data for plotting -------------------------------------------
interface WaveformData {
  axis: number[][];
  segRects: { i0: number; i1: number; color: string }[];
  totalSamples: number;
}

function buildWaveformForPlot(tx: Transaction): WaveformData | null {
  if (!tx.expected || !tx.sr || !tx.samplesPerAxis) return null;
  const states = segmentStates(tx);
  const isTri = tx.axisMask === 0x07;
  const axis: number[][] = [[], [], []];
  const segRects: WaveformData['segRects'] = [];
  let sampleIndex = 0;

  for (let s = 0; s < tx.expected; s++) {
    const pkt = tx.segments.get(s);
    const state = states[s];
    const color = state === 'green' ? COL.green : state === 'red' ? COL.red : state === 'yellow' ? COL.yellow : COL.grey;
    let segLen: number;
    if (pkt) segLen = isTri ? (pkt.Samples_Triplets_i16?.length || 0) : (pkt.Samples_i16?.length || 0);
    else segLen = tx.segSizes?.[s] ?? (isTri ? 7 : 21);
    segRects.push({ i0: sampleIndex, i1: sampleIndex + segLen, color });

    for (let k = 0; k < segLen; k++) {
      if (state === 'green' && pkt) {
        if (isTri) {
          const t = pkt.Samples_Triplets_i16?.[k];
          axis[0].push(t?.[0] ?? 0);
          axis[1].push(t?.[1] ?? 0);
          axis[2].push(t?.[2] ?? 0);
        } else {
          const v = pkt.Samples_i16?.[k] ?? 0;
          const sel = tx.axisMask & 0x07;
          axis[0].push(sel === 0x01 ? v : 0);
          axis[1].push(sel === 0x02 ? v : 0);
          axis[2].push(sel === 0x04 ? v : 0);
        }
      } else {
        axis[0].push(0);
        axis[1].push(0);
        axis[2].push(0);
      }
      sampleIndex++;
    }
  }

  return { axis, segRects, totalSamples: sampleIndex };
}

// --- CSV export -----------------------------------------------------------
function buildCsvForTx(tx: Transaction): string {
  const wf = buildWaveformForPlot(tx);
  if (!wf) throw new Error('Waveform not ready to export');
  const meta = [
    `# tx_id=${tx.txId}`,
    `axis_selection=${tx.params ? tx.params.AxisSelectionText : axisMaskToText(tx.axisMask)}`,
    `sampling_rate_hz=${tx.sr}`,
    `filter=${tx.params ? tx.params.HardwareFilterText : ''}`,
    `segments=${tx.expected}`,
    `samples_per_axis=${tx.samplesPerAxis}`,
    `total_samples=${wf.totalSamples}`,
  ].join(', ');
  const header = 'sample_index,axis1,axis2,axis3';
  const rows: string[] = [];
  for (let i = 0; i < wf.totalSamples; i++) {
    rows.push(`${i},${wf.axis[0][i] ?? 0},${wf.axis[1][i] ?? 0},${wf.axis[2][i] ?? 0}`);
  }
  return `${meta}\n${header}\n${rows.join('\n')}`;
}

function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- SVG waveform plot ----------------------------------------------------
function useResize(elRef: React.RefObject<HTMLDivElement | null>): number {
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!elRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(Math.max(300, e.contentRect.width));
    });
    ro.observe(elRef.current);
    return () => ro.disconnect();
  }, [elRef]);
  return w;
}

function SvgWave({ tx }: { tx: Transaction }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const width = useResize(hostRef);
  const height = 320;
  const pad = { l: 50, r: 16, t: 12, b: 28 };
  const wf = useMemo(() => buildWaveformForPlot(tx), [tx]);
  const contentW = Math.max(10, width - pad.l - pad.r);
  const contentH = Math.max(10, height - pad.t - pad.b);

  if (!wf) return <div ref={hostRef} style={{ height }} />;

  const N = wf.totalSamples || 1;
  const xs = (i: number) => pad.l + (i / (N - 1 || 1)) * contentW;
  const isTri = tx.axisMask === 0x07;
  const activeAxes = isTri ? [0, 1, 2] : (tx.axisMask & 0x01) ? [0] : (tx.axisMask & 0x02) ? [1] : (tx.axisMask & 0x04) ? [2] : [0];
  const allY = activeAxes.flatMap(ai => wf.axis[ai]);
  let ymin = Math.min(...allY, 0);
  let ymax = Math.max(...allY, 0);
  if (ymin === ymax) { ymin = -1; ymax = 1; }
  const ys = (v: number) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * contentH;
  const poly = (arr: number[]) => arr.map((y, i) => `${xs(i)},${ys(y)}`).join(' ');
  const clipId = `clip-${tx.txId}`;
  const axisColors = [COL.axis1, COL.axis2, COL.axis3];
  const axisLabels = ['Axis 1', 'Axis 2', 'Axis 3'];

  return (
    <div ref={hostRef} className="w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <clipPath id={clipId}>
            <rect x={pad.l} y={pad.t} width={contentW} height={contentH} />
          </clipPath>
        </defs>
        <rect x={pad.l} y={pad.t} width={contentW} height={contentH} fill="#0b1730" stroke="#1f2937" />
        <g clipPath={`url(#${clipId})`}>
          {wf.segRects.map((r, i) => (
            <rect key={i} x={xs(r.i0)} y={pad.t} width={xs(r.i1) - xs(r.i0)} height={contentH} fill={r.color} opacity="0.22" />
          ))}
        </g>
        {activeAxes.map((ai) => (
          <polyline key={ai} fill="none" stroke={axisColors[ai]} strokeWidth="2" points={poly(wf.axis[ai])} />
        ))}
        {[ymin, 0, ymax].map((v, i) => (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + contentW} y1={ys(v)} y2={ys(v)} stroke="#334155" strokeDasharray="3 4" />
            <text x={pad.l - 6} y={ys(v) + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{v}</text>
          </g>
        ))}
        {activeAxes.map((ai, i) => (
          <g key={ai} transform={`translate(${pad.l + i * 90}, ${height - pad.b + 16})`}>
            <rect x={0} y={-10} width={18} height={3} fill={axisColors[ai]} />
            <text x={24} y={-6} fontSize="11" fill="#cbd5e1">{axisLabels[ai]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// --- Segment grid ---------------------------------------------------------
function SegmentsGrid({ tx }: { tx: Transaction }) {
  const states = segmentStates(tx);
  return (
    <div className="flex flex-wrap gap-2">
      {states.map((st, i) => (
        <div
          key={i}
          className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-mono"
          style={{
            background: '#f8fafc',
            color: '#334155',
            outline: `3px solid ${COL[st as keyof typeof COL]}`,
            outlineOffset: '2px',
          }}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

// --- Hex display ----------------------------------------------------------
function CodeHex({ bytes }: { bytes: Uint8Array }) {
  if (!bytes) return null;
  const s = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
  return <code className="text-xs break-words whitespace-pre-wrap font-mono text-slate-500">{s}</code>;
}

// --- Legend ----------------------------------------------------------------
function Legend() {
  const items = [
    { color: COL.green, label: 'Received' },
    { color: COL.red, label: 'Missing' },
    { color: COL.yellow, label: 'Requested' },
    { color: COL.grey, label: 'Pending' },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
          {label}
        </div>
      ))}
    </div>
  );
}

// --- Main component -------------------------------------------------------
const EXAMPLE_PACKETS = [
  '03210000070003814e200015',
  '01210000ffff000000020000fffc00020000fffd0003fffffffc0001fffdfffefffeffff0002ffff00000005fffb',
  '01210001fffd0005fff8fffc0003fffa00000004fffc0000000500000003000200020006ffff00030005ffff0000',
  '052100020002fffe00000003fffffffd0003fffdfffcfffffffc0003ffff00000005000000020004000200000007',
].join('\n');

export default function WaveformTracker() {
  const [hexInput, setHexInput] = useState('');
  const [log, setLog] = useState<Packet[]>([]);
  const [waves, setWaves] = useState<WaveState>({});
  const [error, setError] = useState<string | null>(null);

  const onIngest = () => {
    setError(null);
    try {
      const lines = hexInput.split(/\n+/).map(s => s.trim()).filter(Boolean);
      const newPkts = lines.map(decodePacket);
      const newLog = [...log, ...newPkts];
      let state = { ...waves };
      for (const p of newPkts) state = assemble(state, p);
      setLog(newLog);
      setWaves(state);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const onReset = () => {
    setHexInput('');
    setLog([]);
    setWaves({});
    setError(null);
  };

  const activeTxIds = useMemo(
    () => Object.keys(waves).map(k => parseInt(k, 10)).sort((a, b) => a - b),
    [waves],
  );

  const handleDownload = (tx: Transaction) => {
    try {
      const csv = buildCsvForTx(tx);
      downloadText(`airvibe_tx_${tx.txId}_${Date.now()}.csv`, csv);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="my-8 group/tracker">
      <div className="flex items-center gap-4 mb-6">
        <h4 className="text-2xl font-bold text-slate-900 group-hover/tracker:text-blue-600 transition-colors">Waveform Tracker</h4>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Paste hex-encoded uplink packets (Types 01, 03, 05) to decode, assemble, and visualize time waveform data.
      </p>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Input area */}
        <div className="px-4 py-4 space-y-3">
          <textarea
            className="w-full h-32 rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            placeholder="Paste hex packets here, one per line (e.g., 03210000070003814e200015)"
            value={hexInput}
            onChange={e => setHexInput(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              onClick={() => setHexInput(EXAMPLE_PACKETS)}
            >
              Fill Example
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={onIngest}
            >
              Ingest
            </button>
            {log.length > 0 && (
              <button
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={onReset}
              >
                Reset
              </button>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
          )}
        </div>

        {/* Transactions */}
        {activeTxIds.length > 0 && (
          <div className="border-t border-slate-200 divide-y divide-slate-100">
            {activeTxIds.map(txId => {
              const tx = waves[txId];
              return (
                <div key={txId} className="px-4 py-4 space-y-4">
                  {/* Transaction header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Transaction <span className="font-mono">0x{txId.toString(16).padStart(2, '0')}</span>
                    </span>
                    {tx.params ? (
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {tx.params.AxisSelectionText} &middot; {tx.sr} Hz &middot; {tx.expected} segs &middot; {tx.samplesPerAxis} samples/axis
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Waiting for Time Waveform Information Uplink (Type 03)</span>
                    )}
                  </div>

                  {/* Segment map */}
                  {tx.expected != null && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Segment Map</span>
                        <Legend />
                      </div>
                      <SegmentsGrid tx={tx} />
                    </div>
                  )}

                  {/* Suggested downlinks */}
                  {tx.downlinks.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Suggested Downlinks</span>
                      <div className="flex flex-wrap gap-2">
                        {tx.downlinks.map((d, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 rounded px-2 py-1 font-mono">
                            {d.label} &middot; Port {d.port} &middot; {d.hex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Waveform plot */}
                  {tx.params && (
                    <div className="rounded-md border border-slate-200 overflow-hidden">
                      <SvgWave tx={tx} />
                    </div>
                  )}

                  {/* CSV download */}
                  {tx.complete && (
                    <button
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      onClick={() => handleDownload(tx)}
                    >
                      Download assembled CSV
                    </button>
                  )}

                  {/* Packet log */}
                  <details>
                    <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                      Packet log ({tx.segments.size} segments)
                    </summary>
                    <div className="mt-2 space-y-2">
                      {[...tx.segments.entries()].sort((a, b) => a[0] - b[0]).map(([segNo, pkt]) => (
                        <div key={segNo} className="rounded-md bg-slate-50 border border-slate-100 p-3">
                          <div className="text-xs text-slate-600 mb-1">
                            Segment {segNo} &middot; Type {pkt.PacketType === 5 ? '05 (last)' : '01'}
                          </div>
                          <CodeHex bytes={pkt._raw} />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}

        {/* Ingested packet summary */}
        {log.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <details>
              <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                All ingested packets ({log.length})
              </summary>
              <div className="mt-2 space-y-1">
                {log.map((p, idx) => (
                  <div key={idx} className="text-xs text-slate-600">
                    Type {p.PacketType.toString(16).padStart(2, '0').toUpperCase()} &middot; TxID {p.TransactionID} &middot; Seg {p.SegmentNumber}
                    {p.LastSegment ? ' (last)' : ''}
                    {p.PacketType === 3 && ` &middot; ${(p as ParamsPacket).AxisSelectionText}, ${(p as ParamsPacket).NumberOfSegments} segs, ${(p as ParamsPacket).SamplingRate_Hz} Hz`}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Help section */}
        <div className="px-4 py-5 border-t border-slate-200 bg-slate-50">
          <h5 className="text-sm font-semibold text-slate-700 mb-2">How does this work?</h5>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            Time waveform data is transmitted from the sensor as a series of LoRaWAN uplinks. A <strong>Type 03</strong> packet
            announces the transfer parameters (axes, sampling rate, segment count). <strong>Type 01</strong> packets carry
            the actual sample data, and a final <strong>Type 05</strong> packet signals the end of the transfer.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Paste packets in order as they arrive. The tracker assembles them, highlights missing segments, suggests
            the appropriate downlink responses, and plots the reconstructed waveform. When all segments are received,
            you can export the assembled data as CSV.
          </p>
        </div>
      </div>
    </div>
  );
}
