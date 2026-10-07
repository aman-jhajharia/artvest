export type NotificationType =
  | 'POST_LIKED'
  | 'COMMENT_CREATED'
  | 'CREATOR_FOLLOWED'
  | 'COLLABORATION_INQUIRY_CREATED'
  | 'COLLABORATION_ACCEPTED'
  | 'COLLABORATION_DECLINED'
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'SYSTEM'
  | 'COLLAB_INTEREST';

export interface NotificationActor {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId?: string | null;
  actor?: NotificationActor | null;
  type: NotificationType;
  title: string;
  message: string;
  resourceId?: string | null;
  resourceType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
