// @ts-nocheck
import { decodeUplink as codecDecode } from './airvibeCodec.js';

function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/\s+/g, '');
  if (clean.length % 2 !== 0) throw new Error('Invalid hex string');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    out.push(parseInt(clean.substr(i, 2), 16));
  }
  return out;
}

export const decodeUplink = (hex: string, fPort: number) => {
  const bytes = hexToBytes(hex);
  return codecDecode({ bytes, fPort });
};
