// =============== backend/src/routes/auth.ts ===============
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/mailer';

const router = Router();
const prisma = new PrismaClient();
const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Identifiants invalides' });
  const { id, role, site } = user;
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET || 'changeme', {
    expiresIn: '1h'
  });
  res.json({ token, user: { id, username, role, site } });
});

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password, role, site, managerId } = req.body as any;
  if (!username || !password || !role)
    return res.status(400).json({ error: 'Champs manquants' });
  if (!mailRx.test(username))
    return res.status(400).json({ error: 'Format attendu: prenom.nom@alten.com' });
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return res.status(409).json({ error: 'Nom déjà pris' });
  const id = Date.now().toString();
  const hash = bcrypt.hashSync(password, 12);
  const user = await prisma.user.create({ data: { id, username, password: hash, role, site, managerId } });
  const { password: _, ...safe } = user;
  res.status(201).json(safe);
});

// FORGOT PWD
router.post('/forgot', async (req, res) => {
  const { username } = req.body as { username: string };
  if (!username) return res.status(400).json({ error: 'Username requis' });
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(404).json({ error: 'Compte introuvable' });
  // log notification
  await prisma.notification.create({ data: { id: Date.now().toString(), userId: user.id, date: new Date(), message: 'Demande de réinitialisation de mot de passe' } });
  // destinataires: admins valides
  const admins = await prisma.user.findMany({ where: { role: 'admin' } });
  const to = admins.map(a => a.username).filter(u => mailRx.test(u));
  if (user.managerId) {
    const mgr = await prisma.user.findUnique({ where: { id: user.managerId } });
    if (mgr && mailRx.test(mgr.username)) to.push(mgr.username);
  }
  if (to.length === 0) return res.status(500).json({ error: 'Aucun destinataire e-mail valide' });
  try {
    await sendMail(
      to,
      'CAF-Trainer : mot de passe oublié',
      `<p>L’utilisateur <strong>${username}</strong> demande une réinitialisation de son mot de passe.</p><p>Merci de traiter la demande.</p>`
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Envoi e-mail impossible' });
  }
});

export default router;