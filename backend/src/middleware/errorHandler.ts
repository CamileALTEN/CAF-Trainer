import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const sanitize = (input: string) =>
    input.replace(/(token|password)=\S+/gi, '[REDACTED]');
  const message = err.message ? sanitize(String(err.message)) : 'Error';
  const stack = err.stack ? sanitize(String(err.stack)) : undefined;
  logger.error({ message, stack });
  res.status(500).json({ error: 'Internal server error' });
}
