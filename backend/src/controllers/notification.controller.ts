import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { NotificationQuerySchema } from '../validators/notification.validator.js';
import { AppError } from '../utils/apiResponse.js';

export class NotificationController {
  /**
   * GET /api/notifications
   * List paginated notifications for the authenticated user.
   */
  public static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const validatedQuery = NotificationQuerySchema.parse(req.query);
      const result = await NotificationService.getNotifications(req.user.id, validatedQuery);

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Return real-time unread notification count.
   */
  public static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await NotificationService.getUnreadCount(req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a specific notification as read.
   */
  public static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const notificationId = String(req.params.id);
      const updated = await NotificationService.markAsRead(req.user.id, notificationId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all unread notifications for the user as read.
   */
  public static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await NotificationService.markAllAsRead(req.user.id);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
