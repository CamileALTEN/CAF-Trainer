"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// =============== backend/src/index.ts ===============
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
// Charger .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const modules_1 = __importDefault(require("./routes/modules"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const progress_1 = __importDefault(require("./routes/progress"));
const auth_2 = require("./middleware/auth");
require("../config/secrets");
const app = (0, express_1.default)();
const { NODE_ENV = 'development', PORT = 5000, TLS_KEY_PATH, TLS_CERT_PATH } = process.env;
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/users', auth_2.authenticate, users_1.default);
app.use('/api/modules', auth_2.authenticate, modules_1.default);
app.use('/api/notifications', auth_2.authenticate, notifications_1.default);
app.use('/api/progress', auth_2.authenticate, progress_1.default);
app.get('/', (_req, res) => { res.send('🚀 Backend TS avec Prisma démarré !'); });
let server;
if (NODE_ENV === 'production' && (!TLS_KEY_PATH || !TLS_CERT_PATH)) {
    throw new Error('TLS_KEY_PATH and TLS_CERT_PATH must be set in production');
}
if (TLS_KEY_PATH && TLS_CERT_PATH) {
    const key = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', TLS_KEY_PATH));
    const cert = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', TLS_CERT_PATH));
    server = https_1.default.createServer({ key, cert }, app);
    app.use(helmet_1.default.hsts({ maxAge: 63072000, includeSubDomains: true }));
    server.listen(PORT, () => console.log(`🚀 Backend en HTTPS sur port ${PORT}`));
}
else {
    server = app.listen(PORT, () => console.log(`🚀 Backend sur http://localhost:${PORT}`));
}
