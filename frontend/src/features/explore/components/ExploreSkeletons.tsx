'use client';

import React from 'react';

export const CreatorCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 animate-pulse flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <div className="w-32 h-4 rounded bg-white/10" />
              <div className="w-24 h-3 rounded bg-white/5" />
            </div>
          </div>
          <div className="w-16 h-5 rounded bg-white/10" />
        </div>

        <div className="w-full h-3 rounded bg-white/5 mb-2" />
        <div className="w-4/5 h-3 rounded bg-white/5 mb-4" />

        <div className="flex gap-2 mb-4">
          <div className="w-16 h-5 rounded bg-white/5" />
          <div className="w-20 h-5 rounded bg-white/5" />
          <div className="w-14 h-5 rounded bg-white/5" />
        </div>

        <div className="w-full h-8 rounded-xl bg-white/5 mb-3" />
      </div>

      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="w-20 h-7 rounded-lg bg-white/10" />
          <div className="w-16 h-7 rounded-lg bg-white/10" />
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/10" />
      </div>
    </div>
  );
};

export const ShowcaseCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 animate-pulse flex flex-col justify-between">
      <div>
        <div className="aspect-video w-full bg-white/10" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10" />
            <div className="w-28 h-3 rounded bg-white/10" />
          </div>
          <div className="w-3/4 h-4 rounded bg-white/10" />
          <div className="w-full h-3 rounded bg-white/5" />
        </div>
      </div>
      <div className="p-4 border-t border-white/5 flex justify-between">
        <div className="w-16 h-4 rounded bg-white/10" />
        <div className="w-8 h-4 rounded bg-white/10" />
      </div>
    </div>
  );
};

export const ExploreGridSkeleton: React.FC<{ isPosts?: boolean }> = ({ isPosts = false }) => {
  return (
    <div className={`grid grid-cols-1 ${isPosts ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
      {Array.from({ length: 6 }).map((_, i) =>
        isPosts ? <ShowcaseCardSkeleton key={i} /> : <CreatorCardSkeleton key={i} />
      )}
    </div>
  );
};
