import assert from 'assert';

export const JWT_SECRET = process.env.JWT_SECRET || '';
assert(JWT_SECRET, 'JWT_SECRET environment variable must be set');

export const DATA_KEY = process.env.DATA_KEY || '';
assert(DATA_KEY, 'DATA_KEY environment variable must be set');
assert(Buffer.from(DATA_KEY, 'hex').length === 32, 'DATA_KEY must be 32 bytes hex');

export const SSO_CLIENT_ID = process.env.SSO_CLIENT_ID || '';
export const SSO_CLIENT_SECRET = process.env.SSO_CLIENT_SECRET || '';
export const SSO_ISSUER = process.env.SSO_ISSUER || '';
export const SSO_REDIRECT_URI = process.env.SSO_REDIRECT_URI || '';
export const SSO_ADMIN_GROUP = process.env.SSO_ADMIN_GROUP || '';
export const SSO_MANAGER_GROUP = process.env.SSO_MANAGER_GROUP || '';
