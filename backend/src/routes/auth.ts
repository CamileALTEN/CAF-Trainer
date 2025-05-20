// =============== backend/src/routes/auth.ts ===============
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer';
import { JWT_SECRET } from '../config/secrets';
import { verifyTOTP, generateSecret } from '../utils/totp';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../middleware/logger';

const router = Router();
const prisma = new PrismaClient();
const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;

const failures = new Map<string, { count: number; timer: NodeJS.Timeout }>();

function recordFailure(username: string, ip: string) {
  const key = `${username}:${ip}`;
  let entry = failures.get(key);
  if (!entry) {
    entry = { count: 0, timer: setTimeout(() => failures.delete(key), 60_000) };
    failures.set(key, entry);
  }
  entry.count++;
  if (entry.count >= 10) {
    logger.warn('Tentatives de connexion échouées', { username, ip });
    if (process.env.ALERT_EMAIL) {
      sendMail(
        process.env.ALERT_EMAIL,
        'Alerte tentatives de connexion',
        `<p>Trop de tentatives pour ${username} depuis ${ip}</p>`
      ).catch(err => logger.error({ message: 'alert mail failed', error: err.message }));
    }
  }
}

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password, code } = req.body as { username: string; password: string; code?: string };
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    recordFailure(username, req.ip);
    logger.warn('Echec login utilisateur inconnu', { username, ip: req.ip });
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    logger.warn('Tentative sur compte verrouillé', { username, ip: req.ip });
    return res.status(403).json({ error: 'Compte verrouillé. Réessayez plus tard' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    const attempts = user.failedAttempts + 1;
    const data: any = { failedAttempts: attempts };
    if (attempts >= 5) {
      data.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
      data.failedAttempts = 0;
      logger.warn('Compte verrouillé après échecs', { username, ip: req.ip });
    }
    await prisma.user.update({ where: { id: user.id }, data });
    recordFailure(username, req.ip);
    logger.warn('Echec login mauvais mot de passe', { username, ip: req.ip });
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  if (user.twoFactorSecret) {
    if (!code) return res.status(400).json({ error: 'Code 2FA requis' });
    if (!verifyTOTP(code, user.twoFactorSecret)) {
      await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: { increment: 1 } } });
      recordFailure(username, req.ip);
      logger.warn('Echec login 2FA', { username, ip: req.ip });
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockUntil: null } });

  const { id, role, site, tokenVersion } = user;
  const token = jwt.sign({ id, role, tokenVersion }, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
  logger.info('Connexion reussie', { userId: id, ip: req.ip });
  res.json({ token, user: { id, username, role, site } });
});

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password, role = 'caf', site, managerId } = req.body as any;
  if (!username || !password)
    return res.status(400).json({ error: 'Champs manquants' });
  if (!mailRx.test(username))
    return res.status(400).json({ error: 'Format attendu: prenom.nom@alten.com' });
  if (role !== 'caf')
    return res.status(403).json({ error: 'Role interdit' });
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return res.status(409).json({ error: 'Nom déjà pris' });
  const id = Date.now().toString();
  const hash = bcrypt.hashSync(password, 12);
  const user = await prisma.user.create({ data: { id, username, password: hash, role, site, managerId } });
  const { password: _, ...safe } = user;
  logger.info('Utilisateur créé', { createdId: id, ip: req.ip });
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

// 2FA SETUP
router.post('/2fa/setup', authenticate, async (req: AuthRequest, res) => {
  const secret = crypto.randomBytes(20).toString('hex');
  res.json({ secret });
});

router.post('/2fa/enable', authenticate, async (req: AuthRequest, res) => {
  const { secret, code } = req.body as { secret: string; code: string };
  if (!verifyTOTP(code, secret)) {
    return res.status(400).json({ error: 'Code invalide' });
  }
  await prisma.user.update({ where: { id: req.user!.id }, data: { twoFactorSecret: secret } });
  res.json({ ok: true });
});

router.post('/2fa/disable', authenticate, async (req: AuthRequest, res) => {
  await prisma.user.update({ where: { id: req.user!.id }, data: { twoFactorSecret: null } });
  res.json({ ok: true });
});

export default router;