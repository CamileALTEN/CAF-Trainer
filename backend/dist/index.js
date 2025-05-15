"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Charger **immédiatement** le .env du dossier backend
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const modules_1 = __importDefault(require("./routes/modules"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const progress_1 = __importDefault(require("./routes/progress"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/modules', modules_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/progress', progress_1.default);
app.get('/', (_req, res) => {
    res.send('🚀 Backend TS démarré !');
});
app.listen(PORT, () => {
    console.log(`🚀 Backend TS sur http://localhost:${PORT}`);
});
