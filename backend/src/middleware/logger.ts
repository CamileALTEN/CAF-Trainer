import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    const user = (req as any).user;
    logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, user });
  });
  next();
}
