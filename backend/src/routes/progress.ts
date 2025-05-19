// =============== backend/src/routes/progress.ts ===============
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET by username
router.get('/:username', authorize('admin', 'manager', 'caf', 'user'), async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.id !== req.params.username) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const rows = await prisma.progress.findMany({
      where: { user: { username: req.params.username } },
      include: { visitedItems: true }
    });
    res.json(rows);
  } catch (err) { next(err); }
});

// PATCH update/create progress
router.patch('/', authorize('admin', 'manager', 'caf', 'user'), async (req: AuthRequest, res, next) => {
  const { username, moduleId, visited } = req.body as any;
  if (!username || !moduleId) return res.status(400).json({ error: 'Données manquantes' });
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (req.user?.role !== 'admin' && req.user?.id !== user.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    let prog = await prisma.progress.findFirst({ where: { userId: user.id, moduleId } });
    if (!prog) {
      prog = await prisma.progress.create({ data: { userId: user.id, moduleId } });
    }
    await prisma.visitedItem.deleteMany({ where: { progressId: prog.id } });
    for (const itemId of visited || []) {
      await prisma.visitedItem.create({ data: { progressId: prog.id, itemId } });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// GET all or by managerId
router.get('/', authorize('admin', 'manager'), async (req: AuthRequest, res, next) => {
  const { managerId } = req.query;
  try {
    let rows;
    if (req.user?.role === 'manager') {
      const cafs = await prisma.user.findMany({ where: { managerId: req.user.id } });
      rows = await prisma.progress.findMany({ where: { userId: { in: cafs.map(u => u.id) } }, include: { visitedItems: true } });
    } else if (managerId) {
      const cafs = await prisma.user.findMany({ where: { managerId: String(managerId) } });
      rows = await prisma.progress.findMany({ where: { userId: { in: cafs.map(u => u.id) } }, include: { visitedItems: true } });
    } else {
      rows = await prisma.progress.findMany({ include: { visitedItems: true } });
    }
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
