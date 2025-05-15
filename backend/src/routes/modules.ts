             import { Router, Request, Response } from 'express';
             import { read, write }               from '../config/dataStore';
             import { IModule, IItem }            from '../models/IModule';
      
             const router  = Router();
             const TABLE   = 'modules';
      
             /* util ------------------------------------------------------------------ */
             function load(): IModule[]                    { return read<IModule>(TABLE) }
             function save(list: IModule[]): void          { write<IModule>(TABLE,list) }
             function byId(id: string, list = load())      { return list.find(m => m.id === id) }
             function idx(id: string, list = load())       { return list.findIndex(m => m.id === id) }
      
             /* GET /api/modules ------------------------------------------------------- */
             router.get('/', (_req, res) => res.json(load()));
      
             /* GET /api/modules/:id --------------------------------------------------- */
             router.get('/:id', (req, res) => {
               const mod = byId(req.params.id);
               mod ? res.json(mod) : res.status(404).json({ error:'Module non trouvé' });
             });
      
             /* POST /api/modules  (création) ----------------------------------------- */
             router.post('/', (req, res) => {
               const list = load();
               const id   = Date.now().toString();
               const mod: IModule = {
                 id,
                 title:   req.body.title  ?? 'Nouveau module',
                 summary: req.body.summary?? '',
                 enabled: true,
                 items:   [],
               };
               list.push(mod);
               save(list);
               res.status(201).json(mod);
             });
      
             /* PUT /api/modules/:id  (remplacement intégral) ------------------------- */
             router.put('/:id', (req, res) => {
               const list  = load();
               const index = idx(req.params.id, list);
               if (index === -1) return res.status(404).json({ error:'Module non trouvé' });
      
               list[index] = req.body as IModule;
               save(list);
               res.json(list[index]);
             });
      
             /* PATCH /api/modules/:id  (MAJ partielle) ------------------------------- */
             router.patch('/:id', (req, res) => {
               const list  = load();
               const mod   = byId(req.params.id, list);
               if (!mod) return res.status(404).json({ error:'Module non trouvé' });
      
               Object.assign(mod, req.body);
               save(list);
               res.json(mod);
             });
      
             /* DELETE /api/modules/:id ----------------------------------------------- */
             router.delete('/:id', (req, res) => {
               const list  = load();
               const index = idx(req.params.id, list);
               if (index === -1) return res.status(404).json({ error:'Module non trouvé' });
      
               list.splice(index,1);
               save(list);
               res.status(204).end();
             });
      
             export default router;