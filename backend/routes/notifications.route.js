import express from 'express';
import { createNotification, getNotificationsByUser, markNotificationAsRead, readNotifications } from '../controllers/notifications.controller.js';
import {verifyToken} from '../middleware/auth.middleware.js'

const router = express.Router();
router.use(verifyToken);

router.get('/:user_id', getNotificationsByUser);
router.put('/:id/read', markNotificationAsRead);
router.post('/', createNotification)
router.put('/mark-all-read/:user_id', readNotifications)

export default router;