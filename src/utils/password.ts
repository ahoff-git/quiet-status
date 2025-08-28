import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

// Format: scrypt$N=16384,r=8,p=1$<saltHex>$<hashHex>
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64; // 512-bit derived key

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  const saltHex = salt.toString('hex');
  const hashHex = Buffer.from(hash).toString('hex');
  return `scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${saltHex}$${hashHex}`;
}

export function verifyPassword(stored: string | null | undefined, password: string): boolean {
  if (!stored) return false;
  // Basic parse
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const [, params, saltHex, hashHex] = parts;
  const [Nstr, rstr, pstr] = params.replace('N=', '').replace(',r=', ',').replace(',p=', ',').split(',');
  const N = Number(Nstr);
  const r = Number(rstr);
  const p = Number(pstr);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = scryptSync(password, salt, expected.length, { N, r, p });
  return timingSafeEqual(Buffer.from(derived), expected);
}
