"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// =============== backend/src/routes/progress.ts ===============
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET by username
router.get('/:username', async (req, res, next) => {
    try {
        const rows = await prisma.progress.findMany({
            where: { user: { username: req.params.username } },
            include: { visitedItems: true }
        });
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
});
// PATCH update/create progress
router.patch('/', async (req, res, next) => {
    const { username, moduleId, visited } = req.body;
    if (!username || !moduleId)
        return res.status(400).json({ error: 'Données manquantes' });
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        let prog = await prisma.progress.findFirst({ where: { userId: user.id, moduleId } });
        if (!prog) {
            prog = await prisma.progress.create({ data: { userId: user.id, moduleId } });
        }
        await prisma.visitedItem.deleteMany({ where: { progressId: prog.id } });
        for (const itemId of visited || []) {
            await prisma.visitedItem.create({ data: { progressId: prog.id, itemId } });
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
// GET all or by managerId
router.get('/', async (req, res, next) => {
    const { managerId } = req.query;
    try {
        let rows;
        if (managerId) {
            const cafs = await prisma.user.findMany({ where: { managerId: String(managerId) } });
            rows = await prisma.progress.findMany({ where: { userId: { in: cafs.map(u => u.id) } }, include: { visitedItems: true } });
        }
        else {
            rows = await prisma.progress.findMany({ include: { visitedItems: true } });
        }
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
