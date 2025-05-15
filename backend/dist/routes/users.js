"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dataStore_1 = require("../config/dataStore");
const router = (0, express_1.Router)();
const TABLE = 'users';
const hash = (pwd) => bcrypt_1.default.hashSync(pwd, 8);
const mailRx = /^[a-z]+.[a-z][+@alten.com]$/i;
/* ───────────── GET liste complète ───────────── */
router.get('/', (_req, res) => {
    const { managerId } = _req.query;
    let list = (0, dataStore_1.read)(TABLE);
    if (managerId)
        list = list.filter(u => u.managerId === managerId);
    res.json(list.map(({ password, ...u }) => u));
});
/* ───────────── POST création ─────────────────── */
router.post('/', (req, res) => {
    const { username, password, role, site, managerId } = req.body;
    if (!username || !password || !role)
        return res.status(400).json({ error: 'Champs manquants' });
    if (!mailRx.test(username))
        return res.status(400).json({ error: 'Username doit être prenom.nom@alten.com' });
    const list = (0, dataStore_1.read)(TABLE);
    if (list.some(u => u.username === username))
        return res.status(409).json({ error: 'Nom déjà pris' });
    if (role === 'manager' && managerId)
        return res.status(400).json({ error: 'Un manager ne peut avoir de managerId' });
    if (role === 'caf' && !managerId)
        return res.status(400).json({ error: 'managerId requis pour un CAF' });
    const user = {
        id: Date.now().toString(),
        username,
        password: hash(password),
        role: role,
        site,
        managerId,
    };
    list.push(user);
    (0, dataStore_1.write)(TABLE, list);
    const { password: _p, ...clean } = user;
    res.status(201).json(clean);
});
/* ───────────── PATCH mot de passe ────────────── */
router.patch('/:id/password', (req, res) => {
    const { password } = req.body;
    if (!password)
        return res.status(400).json({ error: 'pwd manquant' });
    const list = (0, dataStore_1.read)(TABLE);
    const idx = list.findIndex(u => u.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: 'Introuvable' });
    list[idx].password = hash(password);
    (0, dataStore_1.write)(TABLE, list);
    res.json({ ok: true });
});
/* ───────────── PATCH général ─────────────────── */
router.patch('/:id', (req, res) => {
    const data = req.body;
    const list = (0, dataStore_1.read)(TABLE);
    const idx = list.findIndex(u => u.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: 'Introuvable' });
    if (data.username) {
        if (!mailRx.test(data.username))
            return res.status(400).json({ error: 'Username doit être prenom.nom@alten.com' });
        if (list.some(u => u.username === data.username && u.id !== req.params.id))
            return res.status(409).json({ error: 'Nom déjà pris' });
    }
    Object.assign(list[idx], data);
    (0, dataStore_1.write)(TABLE, list);
    const { password, ...clean } = list[idx];
    res.json(clean);
});
/* ───────────── DELETE ────────────────────────── */
router.delete('/:id', (req, res) => {
    const list = (0, dataStore_1.read)(TABLE);
    const after = list.filter(u => u.id !== req.params.id);
    if (after.length === list.length)
        return res.status(404).json({ error: 'Introuvable' });
    (0, dataStore_1.write)(TABLE, after);
    res.status(204).end();
});
exports.default = router;
