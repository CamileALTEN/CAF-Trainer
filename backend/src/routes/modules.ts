// =============== backend/src/routes/modules.ts ===============
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all modules
router.get('/', async (_req, res, next) => {
  try {
    const modules = await prisma.module.findMany({ include: { items: true } });
    res.json(modules);
  } catch (err) { next(err); }
});

// GET by ID
router.get('/:id', async (req, res, next) => {
  try {
    const mod = await prisma.module.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!mod) return res.status(404).json({ error: 'Module non trouvé' });
    res.json(mod);
  } catch (err) { next(err); }
});

// CREATE
router.post('/', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { title, summary } = req.body;
    const id = Date.now().toString();
    const mod = await prisma.module.create({ data: { id, title: title ?? 'Nouveau module', summary: summary ?? '', enabled: true } });
    res.status(201).json(mod);
  } catch (err) { next(err); }
});

// REPLACE
router.put('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const mod = await prisma.module.update({ where: { id: req.params.id }, data: req.body });
    res.json(mod);
  } catch (err) { next(err); }
});

// PARTIAL UPDATE
router.patch('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const mod = await prisma.module.update({ where: { id: req.params.id }, data: req.body });
    res.json(mod);
  } catch (err) { next(err); }
});

// DELETE
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;