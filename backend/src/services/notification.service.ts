import { prisma } from '../config/database.js';
import { NotificationType } from '@prisma/client';
import { AppError } from '../utils/apiResponse.js';
import { NotificationQuery } from '../validators/notification.validator.js';

export interface CreateNotificationParams {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  resourceId?: string | null;
  resourceType?: string | null; // e.g. "POST", "USER", "INQUIRY"
}

export class NotificationService {
  /**
   * Creates a notification for a user.
   * Rule: Self-notifications are strictly prevented (never notify a user of their own action).
   * Rule: Duplicate events within 60s for the same actor, recipient, type, and resource are debounced.
   */
  public static async createNotification(params: CreateNotificationParams) {
    // 1. Strict self-notification prevention
    if (params.actorId && params.actorId === params.recipientId) {
      return null;
    }

    // 2. Debounce duplicate rapid actions
    if (params.actorId && params.resourceId) {
      const recent = await prisma.notification.findFirst({
        where: {
          recipientId: params.recipientId,
          actorId: params.actorId,
          type: params.type,
          resourceId: params.resourceId,
          createdAt: {
            gte: new Date(Date.now() - 60000), // within 1 minute
          },
        },
      });

      if (recent) {
        return recent;
      }
    }

    // 3. Create notification record
    return prisma.notification.create({
      data: {
        recipientId: params.recipientId,
        actorId: params.actorId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        resourceId: params.resourceId || null,
        resourceType: params.resourceType || null,
        isRead: false,
      },
    });
  }

  /**
   * Retrieves paginated notifications strictly for the authenticated recipient.
   */
  public static async getNotifications(recipientId: string, query: NotificationQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      recipientId,
    };

    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + notifications.length < total,
      },
    };
  }

  /**
   * Calculates unread notification count for a user.
   */
  public static async getUnreadCount(recipientId: string) {
    const count = await prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Marks a specific notification as read.
   * Strictly verifies that the notification belongs to the calling recipient.
   */
  public static async markAsRead(recipientId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    if (notification.recipientId !== recipientId) {
      throw new AppError(
        'You are not authorized to view or mutate this notification',
        403,
        'FORBIDDEN_NOTIFICATION_ACCESS'
      );
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Marks all unread notifications as read for the authenticated recipient.
   */
  public static async markAllAsRead(recipientId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }
}
