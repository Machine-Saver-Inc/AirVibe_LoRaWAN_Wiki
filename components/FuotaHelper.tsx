
import React, { useMemo, useRef, useState } from 'react';

// --- Utility functions -----------------------------------------------------
function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

function hexPrefixed(bytes: Uint8Array): string {
  return '0x' + bytesToHex(bytes);
}

function u32ToBytesLE(n: number): Uint8Array {
  return new Uint8Array([
    n & 0xff,
    (n >>> 8) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 24) & 0xff,
  ]);
}

function chunkBytes(arr: Uint8Array, chunkSize: number): Uint8Array[] {
  const out: Uint8Array[] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    out.push(arr.slice(i, Math.min(i + chunkSize, arr.length)));
  }
  return out;
}

function formatBlockKeyLE(index: number): string {
  const v = index & 0xffff;
  const lo = v & 0xff;
  const hi = (v >>> 8) & 0xff;
  return '0x' + lo.toString(16).padStart(2, '0') + hi.toString(16).padStart(2, '0');
}

function makeInitPayloadLE(size: number): string {
  const cmd = new Uint8Array([0x05, 0x00]);
  const param = u32ToBytesLE(size >>> 0);
  const payload = new Uint8Array(6);
  payload.set(cmd, 0);
  payload.set(param, 2);
  return hexPrefixed(payload);
}

function downloadBlob(filename: string, text: string): boolean {
  try {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  } catch {
    return false;
  }
}

async function safeCopy(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall back */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return !!ok;
  } catch {
    return false;
  }
}

// --- Constants -------------------------------------------------------------
const CHUNK_SIZE = 51;
const VERIFY_PAYLOAD = '0x0600';

// --- Component -------------------------------------------------------------
export default function FuotaHelper() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [err, setErr] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState('');

  const size = bytes?.length ?? 0;
  const chunkCount = useMemo(() => (size ? Math.ceil(size / CHUNK_SIZE) : 0), [size]);
  const sizeBytesLE = useMemo(() => (size ? u32ToBytesLE(size >>> 0) : new Uint8Array(4)), [size]);
  const initPayload = useMemo(() => makeInitPayloadLE(size >>> 0), [size]);

  const jsonObject = useMemo(() => {
    if (!bytes) return null;
    const obj: Record<string, string> = {};
    for (let i = 0; i < chunkCount; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, bytes.length);
      obj[formatBlockKeyLE(i)] = '0x' + bytesToHex(bytes.slice(start, end));
    }
    return obj;
  }, [bytes, chunkCount]);

  function reset() {
    setFile(null);
    setBytes(null);
    setErr('');
    setShowAll(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleFile(f: File) {
    try {
      setErr('');
      const buf = await f.arrayBuffer();
      const view = new Uint8Array(buf);
      if (view.length > 0xffffffff) {
        setErr('Upgrade image size exceeds 32-bit limit.');
        return;
      }
      setFile(f);
      setBytes(view);
    } catch {
      setErr('Failed to read file.');
    }
  }

  function handleDownloadCSV() {
    if (!jsonObject) return;
    const entries = Object.entries(jsonObject);
    const lines = entries.map(([key, value], i) => {
      const keyHex = key.replace(/^0x/, '');
      const valHex = value.replace(/^0x/, '');
      return keyHex + valHex + (i < entries.length - 1 ? ',' : '');
    });
    const csv = lines.join('\n');
    const outName = (file?.name?.replace(/\.[^/.]+$/, '') || 'upgrade') + '.fuota.blocks.csv';
    const ok = downloadBlob(outName, csv);
    showToast(ok ? `Downloaded ${outName}` : 'Download failed by browser policy');
  }

  function handleDownloadJSON() {
    if (!jsonObject) return;
    const pretty = JSON.stringify(jsonObject, null, 2);
    const outName = (file?.name?.replace(/\.[^/.]+$/, '') || 'upgrade') + '.fuota.blocks.json';
    const ok = downloadBlob(outName, pretty);
    showToast(ok ? `Downloaded ${outName}` : 'Download failed by browser policy');
  }

  async function handleCopy(text: string, label: string) {
    const ok = await safeCopy(text);
    showToast(ok ? `${label} copied to clipboard.` : 'Copy blocked by environment. Use Ctrl/Cmd+C.');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  return (
    <div className="my-8 group/fuota">
      <div className="flex items-center gap-4 mb-6">
        <h4 className="text-2xl font-bold text-slate-900 group-hover/fuota:text-blue-600 transition-colors">FUOTA Helper</h4>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Select your <code className="bg-slate-200 px-1 rounded text-xs">upgrade.bin</code> to see the initialization payload, and generate 51-byte FUOTA data blocks as JSON.
      </p>

      {toast && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{toast}</div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* File input */}
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".bin,application/octet-stream"
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer file:transition-colors"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {file && (
              <button
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={reset}
              >
                Reset
              </button>
            )}
          </div>
          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{err}</div>
          )}

          {/* File info */}
          {file && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">File</span>
                <span className="font-mono text-slate-700 break-all">{file.name}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Size</span>
                <span className="font-mono text-slate-700">{size.toLocaleString()} bytes</span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Chunk Size</span>
                <span className="font-mono text-slate-700">51 bytes</span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Total Blocks</span>
                <span className="font-mono text-slate-700">{chunkCount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Downlink commands (Port 22) */}
        <div className="px-4 py-4 border-t border-slate-200 space-y-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Downlink Commands (Port 22)</span>
          <p className="text-sm text-slate-600">
            Initialize uses <code className="bg-slate-200 px-1 rounded text-xs">0x0500</code> + 4-byte LE size.
            Verify uses <code className="bg-slate-200 px-1 rounded text-xs">0x0600</code>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Initialize */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="text-sm font-semibold text-slate-700">Initialize (0x0500 + size LE)</div>
              <div>
                <span className="text-xs text-slate-500">Size param (LE):</span>
                <div className="font-mono text-sm text-slate-700 break-all">{hexPrefixed(sizeBytesLE)}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Downlink payload (Port 22):</span>
                <div className="font-mono text-sm text-slate-700 break-all">{initPayload}</div>
              </div>
              <button
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={() => handleCopy(initPayload, 'Init payload')}
                disabled={!file}
              >
                Copy Initialize Payload
              </button>
            </div>
            {/* Verify */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="text-sm font-semibold text-slate-700">Verify (0x0600)</div>
              <p className="text-xs text-slate-500">Send after all blocks have been delivered (Port 22). Repeat after resending any missed blocks.</p>
              <div className="font-mono text-sm text-slate-700">{VERIFY_PAYLOAD}</div>
              <button
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={() => handleCopy(VERIFY_PAYLOAD, 'Verify payload')}
              >
                Copy Verify Payload
              </button>
            </div>
          </div>
        </div>

        {/* Generated data blocks (Port 25) */}
        <div className="px-4 py-4 border-t border-slate-200 space-y-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Generated Data Blocks (Port 25, 51 bytes each)</span>
          <p className="text-sm text-slate-600">
            JSON maps each <strong>2-byte LE block number</strong> (e.g., <code className="bg-slate-200 px-1 rounded text-xs">"0000"</code>, <code className="bg-slate-200 px-1 rounded text-xs">"0100"</code>) to a hex string.
            The last block may be shorter than 51 bytes.
          </p>

          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleDownloadJSON}
              disabled={!jsonObject}
            >
              Download JSON
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleDownloadCSV}
              disabled={!jsonObject}
            >
              Download Data Blocks CSV
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
              onClick={() => jsonObject && handleCopy(JSON.stringify(jsonObject, null, 2), 'Blocks JSON')}
              disabled={!jsonObject}
            >
              Copy JSON
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
              onClick={() => setShowAll(v => !v)}
              disabled={!jsonObject}
            >
              {showAll ? 'Collapse preview' : 'Show Full JSON Preview'}
            </button>
          </div>

          {jsonObject && (
            <div className="max-h-96 overflow-auto rounded-md bg-slate-50 border border-slate-200 p-3">
              <pre className="text-xs leading-relaxed font-mono text-slate-600">
                {(() => {
                  const entries = Object.entries(jsonObject);
                  const maxPreview = showAll ? entries.length : Math.min(50, entries.length);
                  const previewObj = Object.fromEntries(entries.slice(0, maxPreview));
                  const extra = entries.length - maxPreview;
                  return JSON.stringify(previewObj, null, 2) + (extra > 0 ? `\n... (${extra} more blocks not shown)` : '');
                })()}
              </pre>
            </div>
          )}

          {!jsonObject && (
            <p className="text-sm text-slate-400">Pick an <code className="bg-slate-200 px-1 rounded text-xs">.bin</code> file to generate blocks.</p>
          )}
        </div>

        {/* Data Verification Status Uplink docs */}
        <div className="px-4 py-4 border-t border-slate-200 space-y-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Data Verification Status Uplink (Sensor → Gateway)</span>
          <p className="text-sm text-slate-600">Structure of the uplink payload reported by the device after verification:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Byte #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                <tr><td className="px-4 py-2 font-mono">0</td><td className="px-4 py-2">Packet Type</td><td className="px-4 py-2">17 (0x11)</td></tr>
                <tr><td className="px-4 py-2 font-mono">1</td><td className="px-4 py-2">Missed data flag</td><td className="px-4 py-2">0 = all received, 1 = some missed</td></tr>
                <tr><td className="px-4 py-2 font-mono">2</td><td className="px-4 py-2">Number of missed blocks</td><td className="px-4 py-2">Count (0–25)</td></tr>
                <tr><td className="px-4 py-2 font-mono">3, 4</td><td className="px-4 py-2">Missed block 1</td><td className="px-4 py-2">16-bit LE block number</td></tr>
                <tr><td className="px-4 py-2 font-mono">5, 6</td><td className="px-4 py-2">Missed block 2</td><td className="px-4 py-2">16-bit LE block number</td></tr>
                <tr><td className="px-4 py-2 font-mono text-slate-400">…</td><td className="px-4 py-2 text-slate-400">…</td><td className="px-4 py-2 text-slate-400">…</td></tr>
                <tr><td className="px-4 py-2 font-mono">51, 52</td><td className="px-4 py-2">Missed block 25</td><td className="px-4 py-2">16-bit LE block number</td></tr>
              </tbody>
            </table>
          </div>
          <div className="text-sm text-slate-600 space-y-2">
            <p><strong>Examples:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All data received → <code className="bg-slate-200 px-1 rounded text-xs">0x11 0x00 0x00</code></li>
              <li>Missing data → <code className="bg-slate-200 px-1 rounded text-xs">0x11 0x01 &lt;N&gt; &lt;b1_lo&gt; &lt;b1_hi&gt; …</code></li>
              <li>If more than 25 blocks are missing, only the first 25 are listed. Resend those, verify again.</li>
            </ul>
            <p><strong>Workflow:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Send <code className="bg-slate-200 px-1 rounded text-xs">0x0600</code> (Verify) to Port 22.</li>
              <li>If the uplink reports missed blocks, resend those specific blocks to Port 25.</li>
              <li>Send <code className="bg-slate-200 px-1 rounded text-xs">0x0600</code> again; repeat until flag=0 and count=0.</li>
              <li>Device starts CRC16 check and upgrade.</li>
            </ol>
          </div>
        </div>

        {/* Notes */}
        <div className="px-4 py-5 border-t border-slate-200 bg-slate-50">
          <h5 className="text-sm font-semibold text-slate-700 mb-2">How does this work?</h5>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            The FUOTA (Firmware Update Over-The-Air) process splits a firmware binary into 51-byte blocks for transmission over LoRaWAN.
            The gateway initializes the session, streams data blocks, then verifies receipt. Missing blocks are retransmitted until the sensor confirms a complete image.
          </p>
          <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
            <li>Initialize/Verify commands are sent to <strong>Port 22</strong>.</li>
            <li>Data blocks are sent to <strong>Port 25</strong>.</li>
            <li>Block keys are 2-byte LE hex (e.g., <code className="bg-slate-200 px-1 rounded text-xs">"0000"</code>, <code className="bg-slate-200 px-1 rounded text-xs">"0100"</code>).</li>
            <li>The 32-bit size parameter is Little-Endian.</li>
            <li>All processing happens in your browser — the file is not uploaded.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
