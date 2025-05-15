"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataStore_1 = require("../config/dataStore");
const router = (0, express_1.Router)();
const NOTIFS = 'notifications';
/**
  * GET /api/notifications
  */
router.get('/', (req, res) => {
    res.json((0, dataStore_1.read)(NOTIFS));
});
/**
* POST /api/notifications
* Body: { username, date, message? }
*/
router.post('/', (req, res) => {
    const notifs = (0, dataStore_1.read)(NOTIFS);
    const entry = {
        id: Date.now().toString(),
        ...req.body
    };
    notifs.push(entry);
    (0, dataStore_1.write)(NOTIFS, notifs);
    res.status(201).json(entry);
});
exports.default = router;
