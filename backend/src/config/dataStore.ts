// =============== backend/src/config/dataStore.ts ===============
// Désactivé : utilisation de PrismaClient
export function read<T = any>(name: string): T[] {
    throw new Error('DataStore désactivé : utilisez PrismaClient.');
  }
  export function write<T = any>(name: string, data: T[]): void {
    throw new Error('DataStore désactivé : utilisez PrismaClient.');
  }
  