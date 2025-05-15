"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataStore_1 = require("../config/dataStore");
const router = (0, express_1.Router)();
const TABLE = 'progress';
/* GET /api/progress/:username   – lecture complète d’un CAF */
router.get('/:username', (req, res) => {
    const rows = (0, dataStore_1.read)(TABLE).filter(p => p.username === req.params.username);
    res.json(rows);
});
/* PATCH /api/progress   body:{ username,moduleId,visited } – MAJ 1 module */
router.patch('/', (req, res) => {
    const { username, moduleId, visited } = req.body;
    if (!username || !moduleId)
        return res.status(400).json({ error: 'Données manquantes' });
    const list = (0, dataStore_1.read)(TABLE);
    const idx = list.findIndex(p => p.username === username && p.moduleId === moduleId);
    if (idx === -1)
        list.push({ username, moduleId, visited });
    else
        list[idx].visited = visited;
    (0, dataStore_1.write)(TABLE, list);
    res.json({ ok: true });
});
/* GET /api/progress?managerId=… – progression de tous les CAF d’un manager */
router.get('/', (req, res) => {
    const { managerId } = req.query;
    const rows = (0, dataStore_1.read)(TABLE);
    const users = (0, dataStore_1.read)('users');
    if (managerId) {
        const cafIds = users.filter(u => u.managerId === managerId).map(u => u.username);
        return res.json(rows.filter(r => cafIds.includes(r.username)));
    }
    res.json(rows);
});
exports.default = router;
