// =============== backend/src/index.ts ===============
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';

// Charger .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import modulesRouter from './routes/modules';
import notifsRouter from './routes/notifications';
import progressRouter from './routes/progress';
import { authenticate } from './middleware/auth';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import '../config/secrets';

const app = express();
// Désactive l'en-tête X-Powered-By pour ne pas révéler la version d'Express
app.disable('x-powered-by');
const {
  NODE_ENV = 'development',
  PORT = 5000,
  TLS_KEY_PATH,
  TLS_CERT_PATH,
  ALLOWED_ORIGIN = 'http://localhost:3000',
} = process.env as Record<string, string>;


app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(express.json());
app.use(requestLogger);

app.use('/api/auth', authRouter);
app.use('/api/users', authenticate, usersRouter);
app.use('/api/modules', authenticate, modulesRouter);
app.use('/api/notifications', authenticate, notifsRouter);
app.use('/api/progress', authenticate, progressRouter);

app.get('/', (_req, res) => { res.send('🚀 Backend TS avec Prisma démarré !'); });

app.use(errorHandler);

let server;
if (NODE_ENV === 'production' && (!TLS_KEY_PATH || !TLS_CERT_PATH)) {
  throw new Error('TLS_KEY_PATH and TLS_CERT_PATH must be set in production');
}
if (TLS_KEY_PATH && TLS_CERT_PATH) {
  const key = fs.readFileSync(path.resolve(__dirname, '..', TLS_KEY_PATH));
  const cert = fs.readFileSync(path.resolve(__dirname, '..', TLS_CERT_PATH));
  server = https.createServer({ key, cert }, app);
  app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true }));
  server.listen(PORT, () => console.log(`🚀 Backend en HTTPS sur port ${PORT}`));
} else {
  server = app.listen(PORT, () => console.log(`🚀 Backend sur http://localhost:${PORT}`));
}
