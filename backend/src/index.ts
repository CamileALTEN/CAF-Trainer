import path from 'path';
import dotenv from 'dotenv';

// Charger **immédiatement** le .env du dossier backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import modulesRouter from './routes/modules';
import notifsRouter from './routes/notifications';
import progressRouter from './routes/progress';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/notifications', notifsRouter);
app.use('/api/progress', progressRouter);

app.get('/', (_req, res) => {
res.send('🚀 Backend TS démarré !');
});

app.listen(PORT, () => {
console.log(`🚀 Backend TS sur http://localhost:${PORT}`);
});