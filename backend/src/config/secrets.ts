import assert from 'assert';

export const JWT_SECRET = process.env.JWT_SECRET || '';
assert(JWT_SECRET, 'JWT_SECRET environment variable must be set');

export const DATA_KEY = process.env.DATA_KEY || '';
assert(DATA_KEY, 'DATA_KEY environment variable must be set');
assert(Buffer.from(DATA_KEY, 'hex').length === 32, 'DATA_KEY must be 32 bytes hex');
