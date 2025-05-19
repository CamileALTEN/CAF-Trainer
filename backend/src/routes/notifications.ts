// =============== backend/src/routes/notifications.ts ===============
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET notifications
router.get('/', authorize('admin'), async (_req: AuthRequest, res, next) => {
  try {
    const list = await prisma.notification.findMany();
    res.json(list);
  } catch (err) { next(err); }
});

// POST notification
router.post('/', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const entry = await prisma.notification.create({ data: req.body });
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

export default router;