// --- Colors ---------------------------------------------------------------
export const COL = {
  green: '#00bf63',
  red: '#ff5050',
  grey: '#b4b4b4',
  yellow: '#ffd21f',
  axis1: '#00357a',
  axis2: '#1f80ff',
  axis3: '#c2dcff',
};

// --- Helpers --------------------------------------------------------------
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s|0x/gi, '').toLowerCase();
  if (!/^[0-9a-f]*$/.test(clean)) throw new Error('Hex contains invalid characters');
  if (clean.length % 2 !== 0) throw new Error('Hex length must be even');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) out[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  return out;
}

function u16le(b: Uint8Array, i: number): number {
  return ((b[i + 1] << 8) | b[i]) & 0xFFFF;
}

function i16le(b: Uint8Array, i: number): number {
  const v = u16le(b, i);
  return v & 0x8000 ? v - 0x10000 : v;
}

function i16From(bytes: Uint8Array, start: number, count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(i16le(bytes, start + i * 2));
  }
  return arr;
}

export function axisMaskToText(mask: number): string {
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
export interface ParamsPacket {
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

export interface DataPacket {
  PacketType: 1 | 5;
  TransactionID: number;
  SegmentNumber: number;
  LastSegment: boolean;
  Samples_i16: number[];
  Samples_Triplets_i16: number[][];
  _raw: Uint8Array;
}

export type Packet = ParamsPacket | DataPacket;

export function decodePacket(hex: string): Packet {
  const b = hexToBytes(hex);
  const type = b[0];
  const txId = b[1];

  if (type === 0x03) {
    return {
      PacketType: 3,
      TransactionID: txId,
      SegmentNumber: b[2],
      ErrorCode: b[3],
      AxisSelection: b[4],
      AxisSelectionText: axisMaskToText(b[4]),
      NumberOfSegments: u16le(b, 5),
      HardwareFilterCode: b[7],
      HardwareFilterText: filterCodeToText(b[7]),
      SamplingRate_Hz: u16le(b, 8),
      NumberOfSamplesEachAxis: u16le(b, 10),
      LastSegment: false,
      _raw: b,
    };
  }

  if (type === 0x01 || type === 0x05) {
    const seg = u16le(b, 2);
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
export interface Downlink {
  label: string;
  port: number;
  hex: string;
}

export interface Transaction {
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
  startTime: Date | null;
}

export type WaveState = Record<number, Transaction>;

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
  const mode = '00';
  const count = idxs.length.toString(16).padStart(2, '0');
  const segs = idxs.map(x => x.toString(16).padStart(2, '0')).join('');
  return `${mode}${count}${segs}`;
}

export function assemble(prev: WaveState, pkt: Packet): WaveState {
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
    startTime: new Date(),
  };

  if (pkt.PacketType === 3) {
    tx.params = pkt as ParamsPacket;
    tx.expected = (pkt as ParamsPacket).NumberOfSegments;
    tx.axisMask = (pkt as ParamsPacket).AxisSelection;
    tx.sr = (pkt as ParamsPacket).SamplingRate_Hz;
    tx.samplesPerAxis = (pkt as ParamsPacket).NumberOfSamplesEachAxis;
    if ([0x07, 0x01, 0x02, 0x04].includes(tx.axisMask)) initSegSizes(tx);
    tx.downlinks = [
      { label: 'Send Waveform Acknowledgement Downlink - Information Acknowledgement', port: 20, hex: `03${pkt.TransactionID.toString(16).padStart(2, '0')}` },
    ];
  } else {
    const dataPkt = pkt as DataPacket;
    if (!tx.params) {
      tx.sawDataBeforeParams = true;
      tx.downlinks = [{ label: 'Send Command Downlink · request_current_twf_information 1 (0x0100)', port: 22, hex: '0100' }];
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

  if (pkt.PacketType === 0x05 && missing.length > 0) {
    tx.requestedMissing = true;
    tx.downlinks = [
      ...tx.downlinks,
      { label: `Request Missing Segments [${missing.join(', ')}]`, port: 21, hex: buildMissingHex(missing) },
    ];
  }

  if (complete) {
    tx.downlinks = [
      ...tx.downlinks,
      { label: 'Send Waveform Acknowledgement Downlink - Data Acknowledgement', port: 20, hex: `01${tx.txId.toString(16).padStart(2, '0')}` },
    ];
  }

  return { ...prev, [tx.txId]: { ...tx, missing, maxSeen, complete } };
}

// --- Segment state colors -------------------------------------------------
export function segmentStates(tx: Transaction): string[] {
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
export interface WaveformData {
  axis: number[][];
  segRects: { i0: number; i1: number; color: string }[];
  totalSamples: number;
}

export function buildWaveformForPlot(tx: Transaction): WaveformData | null {
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
function formatDateForFilename(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}_${pad(d.getMinutes())}_${pad(d.getSeconds())}`;
}

function formatDateForCsv(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function csvFilenameForTx(tx: Transaction): string {
  const hexId = `0x${tx.txId.toString(16).padStart(2, '0').toUpperCase()}`;
  const timeStr = tx.startTime ? formatDateForFilename(tx.startTime) : 'unknown';
  return `AirVibe_Waveform_TXid_${hexId}_${timeStr}.csv`;
}

export function buildCsvForTx(tx: Transaction): string {
  const wf = buildWaveformForPlot(tx);
  if (!wf) throw new Error('Waveform not ready to export');
  const isTri = tx.axisMask === 0x07;
  const numAxes = isTri ? 3 : 1;
  const totalSamples = (tx.samplesPerAxis ?? wf.totalSamples) * numAxes;
  const txHex = `0x${tx.txId.toString(16).padStart(2, '0').toUpperCase()}`;
  const startTimeStr = tx.startTime ? formatDateForCsv(tx.startTime) : '';
  const samplePeriod = tx.sr ? 1 / tx.sr : 0;
  const meta = [
    `# tx_id_decimal: ${tx.txId}`,
    `tx_id_hex: ${txHex}`,
    `waveform_start_time: ${startTimeStr}`,
    `axis_selection=${tx.params ? tx.params.AxisSelectionText : axisMaskToText(tx.axisMask)}`,
    `sampling_rate_hz=${tx.sr}`,
    `filter=${tx.params ? tx.params.HardwareFilterText : ''}`,
    `segments=${tx.expected}`,
    `samples_per_axis=${tx.samplesPerAxis}`,
    `total_samples=${totalSamples}`,
  ].join(', ');
  const header = 'sample_index,time_seconds,axis_1_acceleration_milligs,axis_2_acceleration_milligs,axis_3_acceleration_milligs';
  const rows: string[] = [];
  for (let i = 0; i < wf.totalSamples; i++) {
    const time = (i * samplePeriod).toFixed(6);
    rows.push(`${i},${time},${wf.axis[0][i] ?? 0},${wf.axis[1][i] ?? 0},${wf.axis[2][i] ?? 0}`);
  }
  return `${meta}\n${header}\n${rows.join('\n')}`;
}

export function downloadText(filename: string, text: string): void {
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

export const EXAMPLE_PACKETS = [
  '03190000070a0081204e420008',
  '011900000600a60209000900440207000700ca0103000600350101000700930005000500f1ffffff050050fff9ff',
  '011901000100b8fef7ff0000dbfdf6fffdff94fdf7ff02007afdfbff050089fdfaff0300b9fdf6fffeff11fef8ff',
  '01190200f9ff8afef9fff9ff19fffcfff4ffafff0100f3ff53000500fafff8001200ffff90010f00fcff8b020d00',
  '01190300fbffd3020c00fffff5020d00fcffed020d000000c502080005001202070008008d0100000d00eb000000',
  '0119040008004000030005009fff0000040002fffdff030076fef4ff010003fef2ff0500b1fdfaff090081fdfdff',
  '0119050008009afdf5ff0400e0fdf4ff000045fefafffaffc6fefefffbff5efffdfff8fffffffefff9ffa700fdff',
  '01190600ffff490101000000db010300ffffb6020100fefff10205000200040305000500e6020200ffffab020300',
  '011907000000cf0107000400cf01090007003f0105000300faffffff030057ff00000800c1fe000003003cfefdff',
  '011908000000d8fdf6ffffff98fdf7fffcff78fdfffffdff87fdf7fff9ff0ffefefff8ff85fefdfff4ff0eff0000',
  '05190900f4ffacff0300f9ff4e000200fcffee000800',
].join('\n');
