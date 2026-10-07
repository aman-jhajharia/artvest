'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotificationItem, NotificationType } from '@/features/notifications/types/notification.types';
import { NotificationApiService } from '@/features/notifications/services/notification.service';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Sparkles,
  CheckCircle,
  XCircle,
  CheckCheck,
  Loader2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (targetPage = 1, append = false, filter = activeFilter) => {
      try {
        if (!append) setIsLoading(true);
        else setIsLoadingMore(true);

        const res = await NotificationApiService.getNotifications({
          page: targetPage,
          limit: 15,
          unreadOnly: filter === 'unread',
        });

        if (res.success && res.data) {
          if (append) {
            setNotifications((prev) => [...prev, ...res.data!]);
          } else {
            setNotifications(res.data);
          }
          if (res.pagination) {
            setHasMore(res.pagination.hasMore);
            setPage(res.pagination.page);
          }
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeFilter]
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await NotificationApiService.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, false, activeFilter);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount, activeFilter]);

  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await NotificationApiService.markAsRead(notificationId);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await NotificationApiService.markAllAsRead();
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        setActionSuccess('All notifications marked as read');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await handleMarkAsRead(item.id);
    }

    // Contextual routing based on resource type
    if (item.type.includes('COLLABORATION')) {
      router.push('/app/studio');
    } else if (item.type === 'CREATOR_FOLLOWED' && item.actorId) {
      router.push(`/app/explore`);
    } else if (item.resourceId && item.resourceType === 'POST') {
      router.push('/app');
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case 'POST_LIKED':
      case 'LIKE':
        return {
          icon: Heart,
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          dotColor: 'bg-rose-400',
        };
      case 'COMMENT_CREATED':
      case 'COMMENT':
        return {
          icon: MessageSquare,
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          dotColor: 'bg-cyan-400',
        };
      case 'CREATOR_FOLLOWED':
      case 'FOLLOW':
        return {
          icon: UserPlus,
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          dotColor: 'bg-indigo-400',
        };
      case 'COLLABORATION_INQUIRY_CREATED':
      case 'COLLAB_INTEREST':
        return {
          icon: Sparkles,
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          dotColor: 'bg-amber-400',
        };
      case 'COLLABORATION_ACCEPTED':
        return {
          icon: CheckCircle,
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          dotColor: 'bg-emerald-400',
        };
      case 'COLLABORATION_DECLINED':
        return {
          icon: XCircle,
          badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
          dotColor: 'bg-red-400',
        };
      default:
        return {
          icon: Bell,
          badgeColor: 'bg-white/10 text-gray-300 border-white/20',
          dotColor: 'bg-amber-400',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time activity on your showcases, creative interactions, and inquiries
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Success banner */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'unread'
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Unread Only
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl glass-panel border border-white/5 animate-pulse flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/10 rounded w-1/3" />
                <div className="h-2.5 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 glass-panel rounded-2xl border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">
            {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {activeFilter === 'unread'
              ? 'You have viewed all updates. Toggle to "All Activity" to review previous interactions.'
              : 'When creators and enthusiasts like, comment, follow, or collaborate with you, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((item) => {
            const config = getTypeConfig(item.type);
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  !item.isRead
                    ? 'bg-amber-500/[0.04] border-amber-500/25 hover:border-amber-500/40 shadow-sm shadow-amber-500/5'
                    : 'glass-panel border-white/5 hover:border-white/15'
                }`}
              >
                {/* Unread indicator dot */}
                {!item.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400" />
                )}

                {/* Actor Avatar or Icon */}
                <div className="relative shrink-0">
                  {item.actor?.avatarUrl ? (
                    <img
                      src={item.actor.avatarUrl}
                      alt={item.actor.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-800 to-stone-700 border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {item.actor?.name?.charAt(0) || 'A'}
                    </div>
                  )}

                  {/* Type Badge Icon */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border flex items-center justify-center ${config.badgeColor}`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.actor?.name || 'Someone'}
                    </span>
                    <span className="text-xs text-gray-300">{item.message}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(item.createdAt)}
                    </span>

                    {!item.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>

                {/* Arrow hint */}
                <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-400" />
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={() => fetchNotifications(page + 1, true, activeFilter)}
                disabled={isLoadingMore}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading more...
                  </span>
                ) : (
                  'Load More Notifications'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
