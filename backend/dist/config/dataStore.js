"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = read;
exports.write = write;
// =============== backend/src/config/dataStore.ts ===============
// Désactivé : utilisation de PrismaClient
function read(name) {
    throw new Error('DataStore désactivé : utilisez PrismaClient.');
}
function write(name, data) {
    throw new Error('DataStore désactivé : utilisez PrismaClient.');
}
