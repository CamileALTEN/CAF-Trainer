/* backend/src/models/IUser.ts
─────────────────────────── */

export type Role = 'admin' | 'manager' | 'caf' | 'user';

export interface IUser {
    id:        string;
    username:  string;
    password:  string;
    tokenVersion: number;
    role:      Role;   // ← manager ajouté
    site?:     string;           // pour les CAF
    managerId?: string;          // CAF ➟ manager référent
}