"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataStore_1 = require("../config/dataStore");
const router = (0, express_1.Router)();
const TABLE = 'modules';
/* util ------------------------------------------------------------------ */
function load() { return (0, dataStore_1.read)(TABLE); }
function save(list) { (0, dataStore_1.write)(TABLE, list); }
function byId(id, list = load()) { return list.find(m => m.id === id); }
function idx(id, list = load()) { return list.findIndex(m => m.id === id); }
/* GET /api/modules ------------------------------------------------------- */
router.get('/', (_req, res) => res.json(load()));
/* GET /api/modules/:id --------------------------------------------------- */
router.get('/:id', (req, res) => {
    const mod = byId(req.params.id);
    mod ? res.json(mod) : res.status(404).json({ error: 'Module non trouvé' });
});
/* POST /api/modules  (création) ----------------------------------------- */
router.post('/', (req, res) => {
    const list = load();
    const id = Date.now().toString();
    const mod = {
        id,
        title: req.body.title ?? 'Nouveau module',
        summary: req.body.summary ?? '',
        enabled: true,
        items: [],
    };
    list.push(mod);
    save(list);
    res.status(201).json(mod);
});
/* PUT /api/modules/:id  (remplacement intégral) ------------------------- */
router.put('/:id', (req, res) => {
    const list = load();
    const index = idx(req.params.id, list);
    if (index === -1)
        return res.status(404).json({ error: 'Module non trouvé' });
    list[index] = req.body;
    save(list);
    res.json(list[index]);
});
/* PATCH /api/modules/:id  (MAJ partielle) ------------------------------- */
router.patch('/:id', (req, res) => {
    const list = load();
    const mod = byId(req.params.id, list);
    if (!mod)
        return res.status(404).json({ error: 'Module non trouvé' });
    Object.assign(mod, req.body);
    save(list);
    res.json(mod);
});
/* DELETE /api/modules/:id ----------------------------------------------- */
router.delete('/:id', (req, res) => {
    const list = load();
    const index = idx(req.params.id, list);
    if (index === -1)
        return res.status(404).json({ error: 'Module non trouvé' });
    list.splice(index, 1);
    save(list);
    res.status(204).end();
});
exports.default = router;
