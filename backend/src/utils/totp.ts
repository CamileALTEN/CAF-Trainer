import crypto, { createHmac } from 'crypto';

function otpAt(secret: string, counter: number): string {
  const key = Buffer.from(secret, 'hex');
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(0, 0);
  buf.writeUInt32BE(counter, 4);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
  return code.toString().padStart(6, '0');
}

export function verifyTOTP(token: string, secret: string, window = 1): boolean {
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    if (otpAt(secret, counter + i) === token) return true;
  }
  return false;
}

export function generateSecret(): string {
  return Buffer.from(crypto.randomBytes(20)).toString('hex');
}
