import crypto from 'crypto';
import { DATA_KEY } from '../config/secrets';

const KEY = Buffer.from(DATA_KEY, 'hex');
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(data: string): string {
  const buf = Buffer.from(data, 'base64');
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + 16);
  const text = buf.subarray(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(text), decipher.final()]).toString('utf8');
}

export function decryptSafe(data: string): string {
  try {
    return decrypt(data);
  } catch {
    return data;
  }
}
