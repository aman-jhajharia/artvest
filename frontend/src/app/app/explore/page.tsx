'use client';

import React, { Suspense } from 'react';
import { ExploreView } from '@/features/explore/components/ExploreView';
import { ExploreGridSkeleton } from '@/features/explore/components/ExploreSkeletons';

export default function AppExplorePage() {
  return (
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
  );
}
