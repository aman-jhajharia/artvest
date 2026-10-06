'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Sparkles } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, isOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isOnboarded) {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, isAuthenticated, isOnboarded, router]);

  // Loading state with cinematic skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090A10] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse mb-4">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <p className="text-xs font-mono text-gray-400">Verifying ArtVest session...</p>
      </div>
    );
  }

  // If unauthenticated or not onboarded, hold UI while redirect triggers
  if (!isAuthenticated || !isOnboarded) {
    return (
      <div className="min-h-screen bg-[#090A10] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3 animate-spin">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-400">Redirecting to {isAuthenticated ? 'onboarding' : 'login'}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A10] text-gray-100 flex">
      {/* Fixed Sidebar for desktop */}
      <div className="hidden md:block shrink-0">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden glass-panel border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center font-bold text-black text-xs">
              AV
            </div>
            <span className="font-bold text-sm text-white">ArtVest</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a href="/app" className="text-gray-300 hover:text-white">Feed</a>
            <a href="/app/explore" className="text-amber-400 font-medium">Explore</a>
            <a href="/app/studio" className="text-indigo-400">Studio</a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
