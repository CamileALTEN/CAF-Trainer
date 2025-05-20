// =============== backend/src/routes/notifications.ts ===============
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { encrypt, decryptSafe } from '../utils/encryption';

const router = Router();
const prisma = new PrismaClient();

// GET notifications
router.get('/', authorize('admin'), async (_req: AuthRequest, res, next) => {
  try {
    const list = await prisma.notification.findMany();
    const out = list.map(n => ({ ...n, message: decryptSafe(n.message) }));
    res.json(out);
  } catch (err) { next(err); }
});

// POST notification
router.post('/', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const data = { ...req.body, message: encrypt(req.body.message) };
    const entry = await prisma.notification.create({ data });
    res.status(201).json({ ...entry, message: decryptSafe(entry.message) });
  } catch (err) { next(err); }
});

export default router;