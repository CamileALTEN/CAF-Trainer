// =============== backend/src/routes/users.ts ===============
import { Router } from 'express';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;

// GET users (optional managerId)
router.get('/', async (req, res, next) => {
  const { managerId } = req.query;
  try {
    let users;
    if (managerId) {
      users = await prisma.user.findMany({ where: { managerId: String(managerId) } });
    } else {
      users = await prisma.user.findMany();
    }
    // strip password
    const safe = users.map(({ password, ...u }) => u);
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// POST create user
router.post('/', async (req, res, next) => {
  const { username, password, role, site, managerId } = req.body as any;

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
    const hash = bcrypt.hashSync(password, 8);
    const user = await prisma.user.create({
      data: { id, username, password: hash, role, site, managerId }
    });

    // Return user without password
    const { password: _p, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

// PATCH password
router.patch('/:id/password', async (req, res, next) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'pwd manquant' });

  try {
    const hash = bcrypt.hashSync(password, 8);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hash } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PATCH general
router.patch('/:id', async (req, res, next) => {
  const data = req.body as any;
  if (data.username && !mailRx.test(data.username)) {
    return res.status(400).json({ error: 'Username invalide' });
  }

  try {
    const updated = await prisma.user.update({ where: { id: req.params.id }, data });
    const { password, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// DELETE user
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;