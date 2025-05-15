/* backend/src/utils/mailer.ts
    ─────────────────────────────────────────────────────────────────────────
    Gestion SMTP (OVH) : 3 ports tentés : 25 → 587 → 465
*/

import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport               from 'nodemailer/lib/smtp-transport';

/* ---------- variables d’env. ---------- */
const {
MAIL_USER = '',                 // ex. services@conforea.fr
MAIL_PASS = '',                 // ex. Test2025!
MAIL_HOST = 'ns0.ovh.net',      // hôte SMTP OVH
} = process.env;

const PORTS = [ 587];     // ordre de tentative

/* ---------- helper exporté ---------- */
export async function sendMail(
to:      string | string[],     // accepte tableau ou chaîne
subject: string,
html:    string,
): Promise<void> {

if (!MAIL_USER || !MAIL_PASS) {
    throw new Error('MAIL_USER ou MAIL_PASS manquant dans .env');
}

let lastErr: any = null;

for (const port of PORTS) {
    try {
    console.log(`[MAIL] Tentative via port ${port}…`);

    /* options typées pour éviter l’erreur TS2353 */
    const opts: SMTPTransport.Options = {
        host:   MAIL_HOST,
        port,
        secure: port === 465,                // secure seulement sur 465
        auth:   { user: MAIL_USER, pass: MAIL_PASS },
        connectionTimeout: 15_000,
    };

    const transporter: Transporter = nodemailer.createTransport(opts);

    await transporter.verify();            // vérifie la connexion
    await transporter.sendMail({
        from: `"CAF‑Trainer" <${MAIL_USER}>`,
        to,
        subject,
        html,
    });

    console.log(`[MAIL] OK via port ${port}`);
    return;                                // ← succès ! on sort
    } catch (err) {
    lastErr = err;
    console.error(
        `[MAIL] Échec sur le port ${port} :`,
        (err as Error).message,
    );
    }
}

/* si aucune tentative n’a réussi */
throw lastErr ?? new Error('Envoi courriel impossible');
}