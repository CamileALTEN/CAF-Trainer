import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
}
