// =============== backend/src/routes/notifications.ts ===============
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET notifications
router.get('/', async (_req, res, next) => {
  try {
    const list = await prisma.notification.findMany();
    res.json(list);
  } catch (err) { next(err); }
});

// POST notification
router.post('/', async (req, res, next) => {
  try {
    const entry = await prisma.notification.create({ data: req.body });
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

export default router;