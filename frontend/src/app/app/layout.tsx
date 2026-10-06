import React from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
