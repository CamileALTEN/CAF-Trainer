"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.write = exports.read = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.resolve(__dirname, '..', 'data');
function read(name) {
    const file = path_1.default.join(DATA_DIR, `${name}.json`);
    if (!fs_1.default.existsSync(file)) {
        fs_1.default.writeFileSync(file, '[]', 'utf8');
    }
    const content = fs_1.default.readFileSync(file, 'utf8');
    return JSON.parse(content);
}
exports.read = read;
function write(name, data) {
    const file = path_1.default.join(DATA_DIR, `${name}.json`);
    fs_1.default.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
exports.write = write;
