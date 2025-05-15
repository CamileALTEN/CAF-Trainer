import { Router }     from 'express';
import bcrypt          from 'bcrypt';
import { read, write } from '../config/dataStore';
import { IUser, Role } from '../models/IUser';

const router   = Router();
const TABLE    = 'users';
const hash     = (pwd: string) => bcrypt.hashSync(pwd, 8);
const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;


/* ───────────── GET liste complète ───────────── */
router.get('/', (_req, res) => {
    const { managerId } = _req.query as { managerId?: string };
    let list = read<IUser>(TABLE);
    if (managerId) list = list.filter(u => u.managerId === managerId);
    res.json(list.map(({ password, ...u }) => u));
});

/* ───────────── POST création ─────────────────── */
router.post('/', (req, res) => {
const { username, password, role, site, managerId } = req.body as Partial<IUser>;

if (!username || !password || !role)
    return res.status(400).json({ error: 'Champs manquants' });
if (!mailRx.test(username))
    return res.status(400).json({ error: 'Username doit être prenom.nom@alten.com' });

const list = read<IUser>(TABLE);
if (list.some(u => u.username === username))
    return res.status(409).json({ error: 'Nom déjà pris' });

if (role === 'manager' && managerId)
    return res.status(400).json({ error: 'Un manager ne peut avoir de managerId' });
if (role === 'caf' && !managerId)
    return res.status(400).json({ error: 'managerId requis pour un CAF' });

const user: IUser = {
    id: Date.now().toString(),
    username,
    password: hash(password),
    role: role as Role,
    site,
    managerId,
};
list.push(user); write(TABLE, list);
const { password: _p, ...clean } = user;
res.status(201).json(clean);
});

/* ───────────── PATCH mot de passe ────────────── */
router.patch('/:id/password', (req, res) => {
const { password } = req.body as { password: string };
if (!password) return res.status(400).json({ error: 'pwd manquant' });

const list = read<IUser>(TABLE);
const idx  = list.findIndex(u => u.id === req.params.id);
if (idx === -1) return res.status(404).json({ error: 'Introuvable' });

list[idx].password = hash(password);
write(TABLE, list);
res.json({ ok: true });
});

/* ───────────── PATCH général ─────────────────── */
router.patch('/:id', (req, res) => {
const data = req.body as Partial<IUser>;
const list = read<IUser>(TABLE);
const idx  = list.findIndex(u => u.id === req.params.id);
if (idx === -1) return res.status(404).json({ error: 'Introuvable' });

if (data.username) {
    if (!mailRx.test(data.username))
    return res.status(400).json({ error: 'Username doit être prenom.nom@alten.com' });
    if (list.some(u => u.username === data.username && u.id !== req.params.id))
    return res.status(409).json({ error: 'Nom déjà pris' });
}

Object.assign(list[idx], data);
write(TABLE, list);
const { password, ...clean } = list[idx];
res.json(clean);
});

/* ───────────── DELETE ────────────────────────── */
router.delete('/:id', (req, res) => {
const list  = read<IUser>(TABLE);
const after = list.filter(u => u.id !== req.params.id);
if (after.length === list.length)
    return res.status(404).json({ error: 'Introuvable' });
write(TABLE, after);
res.status(204).end();
});

export default router;