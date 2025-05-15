             // client/src/api/auth.ts
      
             export type Role = 'admin' | 'manager' | 'caf' | 'user';
      
             export interface IUser {
               id:        string;
               username:  string;
               role:       Role;   // ← manager ajouté
               site?:     string;
               managerId?: string;
             }