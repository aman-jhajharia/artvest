'use client';

import React from 'react';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import { Bookmark, Sparkles } from 'lucide-react';

export default function SavedPage() {
  return (
    <div>
      <PhaseBanner
        phase="Phase 1 Foundation"
        featureName="Saved Showcases"
        description="Bookmarked creative works and potential collaborator references saved to your user collection. Real database persistence via the Save Prisma entity will be plugged in Phase 4."
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Saved Showcases</h1>
          <p className="text-xs text-gray-400 mt-1">
            Creative showcases and talent portfolios you bookmarked for reference
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto border border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">No Showcases Saved Yet</h3>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          While browsing the creative feed or talent discovery, click the bookmark icon to save
          portfolios, audio tracks, and reels directly to your collection.
        </p>
        <a
          href="/app/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Discover Creators to Save
        </a>
      </div>
    </div>
  );
}
