import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Syslog from 'winston-syslog';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const transports: winston.transport[] = [
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '14d',
  }),
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
  }),
];

if (process.env.SYSLOG_HOST) {
  transports.push(
    new Syslog({
      host: process.env.SYSLOG_HOST,
      port: Number(process.env.SYSLOG_PORT || 514),
      protocol: (process.env.SYSLOG_PROTOCOL as any) || 'udp4',
    })
  );
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
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
