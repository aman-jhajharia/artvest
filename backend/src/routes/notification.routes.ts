import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// In-app Notification routes (all require authentication)
router.get('/', requireAuth, NotificationController.getNotifications);
router.get('/unread-count', requireAuth, NotificationController.getUnreadCount);
router.patch('/read-all', requireAuth, NotificationController.markAllAsRead);
router.patch('/:id/read', requireAuth, NotificationController.markAsRead);

export const notificationRoutes = router;
