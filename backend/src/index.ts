// =============== backend/src/index.ts ===============
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Charger .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import modulesRouter from './routes/modules';
import notifsRouter from './routes/notifications';
import progressRouter from './routes/progress';

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/notifications', notifsRouter);
app.use('/api/progress', progressRouter);

app.get('/', (_req, res) => { res.send('🚀 Backend TS avec Prisma démarré !'); });

app.listen(PORT, () => console.log(`🚀 Backend sur http://localhost:${PORT}`));
