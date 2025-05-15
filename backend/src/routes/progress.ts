             import { Router } from 'express';
             import { read, write } from '../config/dataStore';
             import { IProgress }  from '../models/IProgress';
             import { IUser }      from '../models/IUser';
      
             const router = Router();
             const TABLE  = 'progress';
      
             /* GET /api/progress/:username   – lecture complète d’un CAF */
             router.get('/:username', (req, res) => {
               const rows = read<IProgress>(TABLE).filter(p => p.username === req.params.username);
               res.json(rows);
             });
      
             /* PATCH /api/progress   body:{ username,moduleId,visited } – MAJ 1 module */
             router.patch('/', (req, res) => {
               const { username, moduleId, visited } = req.body as IProgress;
               if (!username || !moduleId) return res.status(400).json({error:'Données manquantes'});
      
               const list = read<IProgress>(TABLE);
               const idx  = list.findIndex(p => p.username===username && p.moduleId===moduleId);
      
               if (idx === -1) list.push({ username, moduleId, visited });
               else            list[idx].visited = visited;
      
               write(TABLE, list);
               res.json({ ok:true });
             });
      
             /* GET /api/progress?managerId=… – progression de tous les CAF d’un manager */
             router.get('/', (req, res) => {
               const { managerId } = req.query as { managerId?: string };
               const rows = read<IProgress>(TABLE);
               const users= read<IUser>('users');
      
               if (managerId) {
                 const cafIds = users.filter(u=>u.managerId===managerId).map(u=>u.username);
                 return res.json(rows.filter(r=>cafIds.includes(r.username)));
               }
               res.json(rows);
             });
      
             export default router;