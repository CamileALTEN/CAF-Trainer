"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// =============== backend/src/routes/notifications.ts ===============
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET notifications
router.get('/', async (_req, res, next) => {
    try {
        const list = await prisma.notification.findMany();
        res.json(list);
    }
    catch (err) {
        next(err);
    }
});
// POST notification
router.post('/', async (req, res, next) => {
    try {
        const entry = await prisma.notification.create({ data: req.body });
        res.status(201).json(entry);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
