'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PostCard } from '@/features/posts/components/PostCard';
import { PostItem } from '@/features/posts/types/post.types';
import { InteractionApiService } from '@/features/interactions/services/interaction.service';
import {
  Bookmark,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadSavedPosts = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await InteractionApiService.getSavedPosts(targetPage, 9);
      if (res.success && res.data) {
        setSavedPosts(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.totalCount || res.data.length);
        }
      } else {
        setErrorMessage(res.message || 'Failed to load saved showcases');
      }
    } catch {
      setErrorMessage('Could not connect to service');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedPosts(page);
  }, [page, loadSavedPosts]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold">
            <Bookmark className="w-4 h-4" />
            <span>Saved Collection</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Bookmarked Showcases
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Creative showcases and talent portfolios you bookmarked for reference ({totalCount})
          </p>
        </div>

        <Link
          href="/app/explore"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Discover More Work</span>
        </Link>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-gray-400">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-mono">Loading your saved creative showcases...</p>
        </div>
      ) : errorMessage ? (
        <div className="glass-card rounded-2xl p-10 text-center max-w-md mx-auto border border-rose-500/20 space-y-3">
          <p className="text-sm text-rose-300">{errorMessage}</p>
          <button
            onClick={() => loadSavedPosts(page)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono"
          >
            Retry
          </button>
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto border border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">
            You haven&apos;t saved any creative work yet.
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
            While browsing the Showcase Feed or Explore Talent, click the bookmark icon on any post to save reels, soundtracks, cinematography, and design systems for reference.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-400/20 hover:brightness-105 transition-all mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Browse Showcase Feed</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {savedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-xs font-mono text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
