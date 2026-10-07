'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { NotificationApiService } from '@/features/notifications/services/notification.service';
import {
  Home,
  Compass,
  FolderGit2,
  Bookmark,
  Bell,
  User as UserIcon,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Lock,
  LogOut,
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const res = await NotificationApiService.getUnreadCount();
        if (res.success && res.data && isMounted) {
          setUnreadNotifications(res.data.unreadCount);
        }
      } catch {
        // Silently catch in navigation sidebar
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Feed', href: '/app', icon: Home },
    { label: 'Discover Talent', href: '/app/explore', icon: Compass },
    { label: 'Creator Studio', href: '/app/studio', icon: LayoutDashboard },
    { label: 'Saved Work', href: '/app/saved', icon: Bookmark },
    { label: 'Notifications', href: '/app/notifications', icon: Bell },
    { label: 'Profile', href: '/app/profile', icon: UserIcon },
  ];

  return (
    <aside className="w-64 border-r border-white/10 glass-panel min-h-screen flex flex-col justify-between p-4 sticky top-0">
      <div>
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 px-3 py-4 mb-4 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
              ArtVest
            </span>
            <span className="text-[10px] tracking-wider text-gray-400 uppercase">
              Talent Ecosystem
            </span>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30 shadow-sm shadow-amber-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.href === '/app/notifications' && unreadNotifications > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black leading-none">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Create Showcase CTA */}
        <div className="mt-6 px-1">
          <Link
            href="/app/studio?action=create"
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:brightness-105 transition-all text-center"
          >
            <PlusCircle className="w-4 h-4" />
            Post Showcase
          </Link>
        </div>

        {/* Phase 2 Feature: Creative Projects */}
        <div className="mt-6 pt-5 border-t border-white/10 px-1">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-2">
            <span>Future End-Term</span>
            <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10">
              Phase 2
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-gray-300 font-medium mb-1">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Creative Projects</span>
              <Lock className="w-3 h-3 text-gray-500 ml-auto" />
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Community-backed project teams & virtual credit wallets.
            </p>
          </div>
        </div>
      </div>

      {/* User Session Footer & Logout */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <Link
          href="/app/profile"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-black font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AV'}
            </div>
          )}
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-xs font-semibold text-white truncate">
              {user?.name || 'ArtVest User'}
            </span>
            <span className="text-[10px] text-amber-400 truncate">
              {user?.role || 'USER'} • {user?.isOnboarded ? 'Active' : 'Pending'}
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
