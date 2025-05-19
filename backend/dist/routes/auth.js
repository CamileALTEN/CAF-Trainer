"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// =============== backend/src/routes/auth.ts ===============
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const mailer_1 = require("../utils/mailer");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;
// LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user)
        return res.status(401).json({ error: 'Identifiants invalides' });
    if (!bcryptjs_1.default.compareSync(password, user.password))
        return res.status(401).json({ error: 'Identifiants invalides' });
    const { id, role, site } = user;
    res.json({ id, username, role, site });
});
// REGISTER
router.post('/register', async (req, res) => {
    const { username, password, role, site, managerId } = req.body;
    if (!username || !password || !role)
        return res.status(400).json({ error: 'Champs manquants' });
    if (!mailRx.test(username))
        return res.status(400).json({ error: 'Format attendu: prenom.nom@alten.com' });
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists)
        return res.status(409).json({ error: 'Nom déjà pris' });
    const id = Date.now().toString();
    const hash = bcryptjs_1.default.hashSync(password, 8);
    const user = await prisma.user.create({ data: { id, username, password: hash, role, site, managerId } });
    const { password: _, ...safe } = user;
    res.status(201).json(safe);
});
// FORGOT PWD
router.post('/forgot', async (req, res) => {
    const { username } = req.body;
    if (!username)
        return res.status(400).json({ error: 'Username requis' });
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user)
        return res.status(404).json({ error: 'Compte introuvable' });
    // log notification
    await prisma.notification.create({ data: { id: Date.now().toString(), userId: user.id, date: new Date(), message: 'Demande de réinitialisation de mot de passe' } });
    // destinataires: admins valides
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    const to = admins.map(a => a.username).filter(u => mailRx.test(u));
    if (user.managerId) {
        const mgr = await prisma.user.findUnique({ where: { id: user.managerId } });
        if (mgr && mailRx.test(mgr.username))
            to.push(mgr.username);
    }
    if (to.length === 0)
        return res.status(500).json({ error: 'Aucun destinataire e-mail valide' });
    try {
        await (0, mailer_1.sendMail)(to, 'CAF-Trainer : mot de passe oublié', `<p>L’utilisateur <strong>${username}</strong> demande une réinitialisation de son mot de passe.</p><p>Merci de traiter la demande.</p>`);
        res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Envoi e-mail impossible' });
    }
});
exports.default = router;
