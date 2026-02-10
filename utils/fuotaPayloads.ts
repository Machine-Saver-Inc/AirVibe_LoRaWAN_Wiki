// --- Utility functions -----------------------------------------------------
export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

export function hexPrefixed(bytes: Uint8Array): string {
  return '0x' + bytesToHex(bytes);
}

export function u32ToBytesLE(n: number): Uint8Array {
  return new Uint8Array([
    n & 0xff,
    (n >>> 8) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 24) & 0xff,
  ]);
}

export function chunkBytes(arr: Uint8Array, chunkSize: number): Uint8Array[] {
  const out: Uint8Array[] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    out.push(arr.slice(i, Math.min(i + chunkSize, arr.length)));
  }
  return out;
}

export function formatBlockKeyLE(index: number): string {
  const v = index & 0xffff;
  const lo = v & 0xff;
  const hi = (v >>> 8) & 0xff;
  return '0x' + lo.toString(16).padStart(2, '0') + hi.toString(16).padStart(2, '0');
}

export function makeInitPayloadLE(size: number): string {
  const cmd = new Uint8Array([0x05, 0x00]);
  const param = u32ToBytesLE(size >>> 0);
  const payload = new Uint8Array(6);
  payload.set(cmd, 0);
  payload.set(param, 2);
  return hexPrefixed(payload);
}

export function downloadBlob(filename: string, text: string): boolean {
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

export async function safeCopy(text: string): Promise<boolean> {
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
export const CHUNK_SIZE = 51;
export const VERIFY_PAYLOAD = '0x0600';
