// @ts-nocheck
import { encodeDownlink as codecEncode } from './airvibeCodec.js';

function bytesToHex(bytes: number[]): string {
  return bytes.map(b => (b < 16 ? '0' : '') + (b & 0xff).toString(16)).join('');
}

export const encodeDownlink = (input: any): { hex: string; fPort: number; error?: string } => {
  const result = codecEncode(input);
  if (result.errors && result.errors.length > 0) {
    return { hex: '', fPort: result.fPort || 0, error: result.errors.join('; ') };
  }
  return { hex: bytesToHex(result.bytes), fPort: result.fPort };
};
