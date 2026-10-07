'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ExploreView } from '@/features/explore/components/ExploreView';
import { ExploreGridSkeleton } from '@/features/explore/components/ExploreSkeletons';

export default function PublicExplorePage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-28 rounded-2xl bg-white/5 animate-pulse" />
              <ExploreGridSkeleton />
            </div>
          }
        >
          <ExploreView />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
