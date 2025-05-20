// =============== backend/src/routes/users.ts ===============
import { Router } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { logger } from '../middleware/logger';

import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;

// GET users (optional managerId)
router.get('/', authorize('admin', 'manager'), async (req: AuthRequest, res, next) => {
  try {
    let users;
    if (req.user?.role === 'manager') {
      users = await prisma.user.findMany({ where: { managerId: req.user.id } });
    } else if (req.query.managerId) {
      users = await prisma.user.findMany({ where: { managerId: String(req.query.managerId) } });
    } else {
      users = await prisma.user.findMany();
    }
    const safe = users.map(({ password, ...u }) => u);
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// POST create user
router.post('/', authorize('admin', 'manager'), async (req: AuthRequest, res, next) => {
  let { username, password, role, site, managerId } = req.body as any;

  // Managers can only create CAF accounts for themselves
  if (req.user?.role === 'manager') {
    role = 'caf';
    managerId = req.user.id;
  }

  // Validations
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  if (!mailRx.test(username)) {
    return res.status(400).json({ error: 'Username doit être prenom.nom@alten.com' });
  }
  if (role === 'manager' && managerId) {
    return res.status(400).json({ error: 'Un manager ne peut pas avoir de managerId' });
  }
  if (role === 'caf' && !managerId) {
    return res.status(400).json({ error: 'managerId requis pour un CAF' });
  }

  try {
    // Ensure username is unique
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(409).json({ error: 'Nom déjà pris' });
    }

    // Create user with generated id
    const id = Date.now().toString();
    const hash = bcrypt.hashSync(password, 12);
    const user = await prisma.user.create({
      data: { id, username, password: hash, role, site, managerId }
    });

    // Return user without password
    const { password: _p, ...safe } = user;
    logger.info('Utilisateur cree', { userId: id, by: req.user?.id, ip: req.ip });
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

// PATCH password
router.patch('/:id/password', authorize('admin', 'manager', 'caf', 'user'), async (req: AuthRequest, res, next) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'pwd manquant' });

  try {
    if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const hash = bcrypt.hashSync(password, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hash } });
    logger.info('Changement mot de passe', { userId: req.params.id, by: req.user?.id, ip: req.ip });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST revoke tokens by incrementing tokenVersion
router.post('/:id/revoke', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { tokenVersion: { increment: 1 } } });
    logger.info('Revocation tokens', { userId: req.params.id, by: req.user?.id, ip: req.ip });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH general
router.patch('/:id', authorize('admin', 'manager', 'caf', 'user'), async (req: AuthRequest, res, next) => {
  const data = { ...req.body } as any;
  if (data.username && !mailRx.test(data.username)) {
    return res.status(400).json({ error: 'Username invalide' });
  }

  // Non-admin users cannot escalate privileges
  if (req.user?.role !== 'admin') {
    delete data.role;
    delete data.managerId;
  }
  delete data.password; // mot de passe via route dédiée

  try {
    if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const updated = await prisma.user.update({ where: { id: req.params.id }, data });
    const { password, ...safe } = updated;
    logger.info('Utilisateur modifie', { userId: req.params.id, by: req.user?.id, ip: req.ip });
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// DELETE user
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    logger.warn('Utilisateur supprime', { userId: req.params.id, by: req.user?.id, ip: req.ip });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;