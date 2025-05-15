/* backend/src/routes/auth.ts
───────────────────────────────────────────────────────────────────────── */

import { Router }        from 'express';
import bcrypt            from 'bcrypt';
import { read, write }   from '../config/dataStore';
import { IUser }         from '../models/IUser';
import { sendMail }      from '../utils/mailer';

const router   = Router();
const USERS    = 'users';
const NOTIFS   = 'notifications';
const mailRx = /^[a-z0-9]+(\.[a-z0-9]+)?@alten\.com$/i;


/* ───────────────────────── LOGIN ───────────────────────── */
router.post('/login', (req, res) => {
    const { username, password } = req.body as { username: string; password: string };
    const users = read<IUser>(USERS);

    const user = users.find(u => {
    if (u.username !== username) return false;
    /* mot de passe haché ? → bcrypt.compare */
    if (u.password.startsWith('$2')) return bcrypt.compareSync(password, u.password);
    /* anciens comptes demo non hachés */
    return u.password === password;
    });

    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const { id, role, site } = user;
    res.json({ id, username, role, site });
});

/* ───────────────────────── REGISTER ────────────────────── */
router.post('/register', (req, res) => {
    const { username, password, role, site, managerId } = req.body as Partial<IUser>;

    if (!username || !password || !role)
    return res.status(400).json({ error: 'Champs manquants' });
    if (!mailRx.test(username))
    return res.status(400).json({ error: 'Format attendu : prenom.nom@alten.com' });

    const users = read<IUser>(USERS);
    if (users.some(u => u.username === username))
    return res.status(409).json({ error: 'Nom déjà pris' });

    const id = Date.now().toString();
    const newUser: IUser = {
    id,
    username,
    password: bcrypt.hashSync(password, 8),
    role,
    site,
    managerId,
    } as IUser;

    users.push(newUser);
    write(USERS, users);
    res.status(201).json({ id, username, role, site, managerId });
});

/* ───────────────────────── FORGOT PWD ───────────────────── */
router.post('/forgot', (req, res) => {
    const { username } = req.body as { username: string };
    if (!username) return res.status(400).json({ error: 'Username requis' });

    const users = read<IUser>(USERS);
    const user  = users.find(u => u.username === username);
    if (!user)  return res.status(404).json({ error: 'Compte introuvable' });

    /* log notification */
    const notifs = read<any>(NOTIFS);
    notifs.push({
    id: Date.now().toString(),
    username,
    date: new Date().toISOString(),
    message: 'Demande de réinitialisation de mot de passe',
    });
    write(NOTIFS, notifs);

    /* destinataires : tous les admins possédant une adresse valide + manager référent éventuel */
    const admins      = users
    .filter(u => u.role === 'admin' && mailRx.test(u.username))
    .map(u => u.username);
    const managerMail = user.managerId
    ? users.find(u => u.id === user.managerId)?.username
    : undefined;

    const to = [
    ...admins,
    ...(managerMail && mailRx.test(managerMail) ? [managerMail] : []),
    ];

    if (to.length === 0) {
    console.error('[FORGOT] Aucun destinataire e‑mail valide');
    return res.status(500).json({ error: 'Aucun destinataire e‑mail valide' });
    }

    /* envoi */
    sendMail(
    to,
    'CAF‑Trainer : mot de passe oublié',
    `<p>L’utilisateur <strong>${username}</strong> demande une réinitialisation de son mot de passe.</p>
        <p>Merci de traiter la demande dans l’interface d’administration.</p>`,
    )
    .then(() => res.json({ ok: true }))
    .catch(err => {
        console.error('[FORGOT]', (err as Error).message);
        res.status(500).json({ error: 'Envoi e‑mail impossible' });
    });
});

export default router;