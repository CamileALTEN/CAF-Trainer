import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets';
import { PrismaClient } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const prisma = new PrismaClient();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { id: string; role: string; tokenVersion: number };
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { tokenVersion: true, role: true } });
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: 'Token révoqué' });
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
};
