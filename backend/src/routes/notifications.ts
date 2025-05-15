import { Router } from 'express';
import { read, write } from '../config/dataStore';
import { INotification } from '../models/INotification';

const router = Router();
const NOTIFS = 'notifications';

/**
  * GET /api/notifications
  */
router.get('/', (req, res) => {
res.json(read<INotification>(NOTIFS));
});

/**
* POST /api/notifications
* Body: { username, date, message? }
*/
router.post('/', (req, res) => {
const notifs = read<INotification>(NOTIFS);
const entry: INotification = {
    id: Date.now().toString(),
    ...req.body as Omit<INotification,'id'>
};
notifs.push(entry);
write(NOTIFS, notifs);
res.status(201).json(entry);
});

export default router;