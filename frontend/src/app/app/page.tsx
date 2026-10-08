'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PostItem, PostType } from '@/features/posts/types/post.types';
import { PostApiService } from '@/features/posts/services/post.service';
import { PostCard } from '@/features/posts/components/PostCard';
import { CreateShowcaseModal } from '@/features/posts/components/CreateShowcaseModal';
import {
  Sparkles,
  PlusCircle,
  Filter,
  RefreshCw,
  Loader2,
  Compass,
  Layers,
  Music,
  Film,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

export default function FeedPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedType, setSelectedType] = useState<PostType | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeed = useCallback(
    async (targetPage = 1, append = false) => {
      if (targetPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const queryParams: any = {
          page: targetPage,
          limit: 10,
        };

        if (selectedType !== 'ALL') {
          queryParams.postType = selectedType;
        }

        const res = await PostApiService.getFeed(queryParams);

        if (res.success && res.data) {
          if (append) {
            setPosts((prev) => [...prev, ...(res.data || [])]);
          } else {
            setPosts(res.data || []);
          }

          if (res.pagination) {
            setHasMore(res.pagination.hasMore);
          }
        }
      } catch (err) {
        console.error('Failed to load showcase feed:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedType]
  );

  useEffect(() => {
    setPage(1);
    fetchFeed(1, false);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, true);
  };

  const handleCreatedSuccess = (newPost: PostItem) => {
    if (newPost.status === 'PUBLISHED') {
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">Showcase Feed</h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Live
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Chronological stream of creative work, audio stems, showreels, and visual art from verified creators
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchFeed(1, false)}
            title="Refresh feed"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-black text-xs font-bold shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Showcase</span>
          </button>
        </div>
      </div>

      {/* Medium Type Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'ALL', label: 'All Showcases', icon: Layers },
          { id: 'IMAGE', label: 'Visual Art', icon: ImageIcon },
          { id: 'VIDEO', label: 'Video Reels', icon: Film },
          { id: 'AUDIO', label: 'Audio Stems', icon: Music },
          { id: 'TEXT', label: 'Writing & Scripts', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20 font-bold'
                  : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feed Stream */}
      {isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs font-mono text-gray-400">Loading creative showcases...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Pagination / Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors inline-flex items-center gap-2"
              >
                {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : null}
                <span>Load More Showcases</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">Your creative feed is just getting started.</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No published showcases found for this format yet. Be the first to share your work with the ArtVest community!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-400/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish the First Showcase</span>
          </button>
        </div>
      )}

      {/* Creation Modal */}
      <CreateShowcaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreatedSuccess}
      />
    </div>
  );
}
