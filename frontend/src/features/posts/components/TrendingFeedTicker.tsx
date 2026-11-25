'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostItem } from '../types/post.types';
import { PostApiService } from '../services/post.service';
import { resolveMediaUrl } from '../utils/mediaUrl';
import {
  Sparkles,
  Heart,
  MessageSquare,
  Bookmark,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

interface TrendingFeedTickerProps {
  onRefresh?: number;
}

export const TrendingFeedTicker: React.FC<TrendingFeedTickerProps> = ({ onRefresh = 0 }) => {
  const router = useRouter();
  const [trendingPosts, setTrendingPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTrending = async () => {
      try {
        const res = await PostApiService.getTrending(10);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setTrendingPosts(res.data);
        }
      } catch (err) {
        console.error('Failed to load trending ticker posts:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTrending();
    return () => {
      isMounted = false;
    };
  }, [onRefresh]);

  // Graceful Empty State: Collapse cleanly if no trending posts exist
  if (!isLoading && trendingPosts.length === 0) {
    return null;
  }

  // Marquee Density Refinement: Ensure minimum 6 items for wide screens
  let trackItems = [...trendingPosts];
  if (trackItems.length > 0) {
    while (trackItems.length < 6) {
      trackItems = [...trackItems, ...trendingPosts];
    }
  }

  // Consistent speed calculation based on track item density
  const dynamicDuration = Math.max(22, trackItems.length * 5);

  const handleItemClick = (e: React.MouseEvent, post: PostItem) => {
    e.preventDefault();
    const postElement = document.getElementById(`post-${post.id}`);
    if (postElement) {
      postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      postElement.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'ring-offset-[#090a10]', 'transition-all');
      setTimeout(() => {
        postElement.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'ring-offset-[#090a10]');
      }, 2500);
    } else {
      const creatorId = post.creatorProfile?.id || post.creatorProfileId || post.authorId;
      router.push(`/creator/${creatorId}`);
    }
  };

  const getCategoryClass = (themeKey?: string | null) => {
    switch (themeKey) {
      case 'music':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
      case 'film':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
      case 'dance':
        return 'text-purple-300 bg-purple-500/10 border-purple-500/20';
      case 'photography':
        return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20';
      case 'design':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  const renderMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Film className="w-3.5 h-3.5 text-amber-400" />;
      case 'AUDIO':
        return <Music className="w-3.5 h-3.5 text-rose-400" />;
      case 'TEXT':
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card border border-amber-400/25 bg-gradient-to-r from-amber-500/[0.04] via-black/50 to-amber-500/[0.04] p-1 shadow-lg shadow-black/40">
      <div className="flex items-center">
        {/* Fixed Left Ticker Anchor */}
        <div className="relative z-10 flex items-center gap-2 pl-3.5 pr-4 py-2 bg-[#0d101b] border-r border-white/10 shrink-0 rounded-l-xl shadow-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <div className="flex items-center gap-1.5 font-black text-amber-300 text-xs tracking-wider uppercase font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Trending</span>
          </div>
        </div>

        {/* Scrolling Track Container */}
        <div
          className="overflow-hidden flex-1 relative py-1.5"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)' }}
        >
          <div
            className="animate-marquee group flex items-center gap-3"
            style={{ '--marquee-duration': `${dynamicDuration}s` } as React.CSSProperties}
          >
            {/* First Half */}
            <div className="flex items-center gap-3 shrink-0">
              {trackItems.map((post, idx) => {
                const mediaItem = post.media?.[0];
                const resolvedThumb = resolveMediaUrl(mediaItem?.thumbnailUrl || mediaItem?.url);
                const category = post.category || post.creatorProfile?.primaryCategory;
                const creatorName = post.creatorProfile?.stageName || post.author?.name || 'Creator';

                return (
                  <button
                    key={`track1-${post.id}-${idx}`}
                    type="button"
                    onClick={(e) => handleItemClick(e, post)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-left transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                    title={`View ${post.title || post.caption}`}
                  >
                    {/* Media Thumbnail or Category Icon */}
                    <div className="w-8 h-8 rounded-lg bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {resolvedThumb ? (
                        <img
                          src={resolvedThumb}
                          alt={post.title || 'Showcase'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        renderMediaIcon(post.postType)
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-col min-w-0 max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {post.title || post.caption}
                        </span>
                        {category && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${getCategoryClass(
                              category.themeKey
                            )}`}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="truncate text-gray-300 font-medium">@{creatorName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 font-mono text-rose-300">
                          <Heart className="w-2.5 h-2.5 fill-rose-500/60" />
                          {post.likeCount ?? 0}
                        </span>
                        <span className="flex items-center gap-0.5 font-mono text-amber-300">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {post.commentCount ?? 0}
                        </span>
                        {post.saveCount !== undefined && post.saveCount > 0 && (
                          <span className="flex items-center gap-0.5 font-mono text-indigo-300">
                            <Bookmark className="w-2.5 h-2.5 fill-indigo-400/50" />
                            {post.saveCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Second Half (Identical duplicate for seamless infinite loop) */}
            <div className="flex items-center gap-3 shrink-0" aria-hidden="true">
              {trackItems.map((post, idx) => {
                const mediaItem = post.media?.[0];
                const resolvedThumb = resolveMediaUrl(mediaItem?.thumbnailUrl || mediaItem?.url);
                const category = post.category || post.creatorProfile?.primaryCategory;
                const creatorName = post.creatorProfile?.stageName || post.author?.name || 'Creator';

                return (
                  <button
                    key={`track2-${post.id}-${idx}`}
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => handleItemClick(e, post)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-left transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                  >
                    {/* Media Thumbnail or Category Icon */}
                    <div className="w-8 h-8 rounded-lg bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {resolvedThumb ? (
                        <img
                          src={resolvedThumb}
                          alt={post.title || 'Showcase'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        renderMediaIcon(post.postType)
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-col min-w-0 max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {post.title || post.caption}
                        </span>
                        {category && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${getCategoryClass(
                              category.themeKey
                            )}`}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="truncate text-gray-300 font-medium">@{creatorName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 font-mono text-rose-300">
                          <Heart className="w-2.5 h-2.5 fill-rose-500/60" />
                          {post.likeCount ?? 0}
                        </span>
                        <span className="flex items-center gap-0.5 font-mono text-amber-300">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {post.commentCount ?? 0}
                        </span>
                        {post.saveCount !== undefined && post.saveCount > 0 && (
                          <span className="flex items-center gap-0.5 font-mono text-indigo-300">
                            <Bookmark className="w-2.5 h-2.5 fill-indigo-400/50" />
                            {post.saveCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
