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
  const dynamicDuration = Math.max(28, trackItems.length * 6);

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

  const renderMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Film className="w-6 h-6 text-amber-400" />;
      case 'AUDIO':
        return <Music className="w-6 h-6 text-rose-400" />;
      case 'TEXT':
        return <FileText className="w-6 h-6 text-indigo-400" />;
      default:
        return <ImageIcon className="w-6 h-6 text-cyan-400" />;
    }
  };

  const renderCard = (post: PostItem, key: string, isAriaHidden = false) => {
    const mediaItem = post.media?.[0];
    const resolvedThumb = resolveMediaUrl(mediaItem?.thumbnailUrl || mediaItem?.url);
    const categoryName = post.category?.name || post.creatorProfile?.primaryCategory?.name || 'Showcase';
    const creatorHandle = post.creatorProfile?.stageName || post.author?.name || 'Creator';
    const likesCount = post.likeCount ?? 0;
    const commentsCount = post.commentCount ?? 0;

    return (
      <div
        key={key}
        role="button"
        tabIndex={isAriaHidden ? -1 : 0}
        onClick={(e) => handleItemClick(e, post)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleItemClick(e as unknown as React.MouseEvent, post);
          }
        }}
        className="w-[250px] shrink-0 rounded-2xl bg-[#12151f] border border-white/[0.08] hover:border-amber-400/40 p-3 transition-all cursor-pointer group flex flex-col text-left"
      >
        {/* Top Media Preview */}
        <div className="h-32 w-full rounded-xl overflow-hidden bg-black/40 relative shrink-0">
          {resolvedThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedThumb}
              alt={post.title || post.caption || 'Showcase'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#181c2b] to-black flex items-center justify-center text-slate-400">
              {renderMediaIcon(post.postType)}
            </div>
          )}
        </div>

        {/* Category Pill */}
        <div className="mt-2.5 flex items-center">
          <span className="bg-amber-500/15 text-amber-400 border border-amber-400/20 text-[11px] font-medium px-2.5 py-0.5 rounded-full truncate">
            {categoryName}
          </span>
        </div>

        {/* Post Title */}
        <h4 className="text-sm font-semibold text-white truncate mt-2 group-hover:text-amber-300 transition-colors">
          {post.title || post.caption}
        </h4>

        {/* Bottom Meta Row */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 gap-2">
          <span className="text-xs text-slate-400 truncate">
            @{creatorHandle}
          </span>
          <div className="flex items-center gap-2.5 shrink-0 text-xs font-mono">
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3 h-3 fill-rose-500/60" />
              {likesCount}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <MessageSquare className="w-3 h-3" />
              {commentsCount}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel border border-white/10 p-4 space-y-3 shadow-lg shadow-black/40">
      {/* Header Row (Clean Left-Only Title) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-wider text-xs font-semibold text-amber-400 uppercase font-mono">
            TRENDING NOW
          </span>
        </div>
      </div>

      {/* Scrolling Track Container */}
      <div
        className="overflow-hidden relative py-1"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
        }}
      >
        <div
          className="animate-marquee flex items-center gap-4"
          style={{ '--marquee-duration': `${dynamicDuration}s` } as React.CSSProperties}
        >
          {/* First Half */}
          <div className="flex items-center gap-4 shrink-0">
            {trackItems.map((post, idx) => renderCard(post, `track1-${post.id}-${idx}`))}
          </div>

          {/* Second Half (Identical duplicate for seamless infinite loop) */}
          <div className="flex items-center gap-4 shrink-0" aria-hidden="true">
            {trackItems.map((post, idx) => renderCard(post, `track2-${post.id}-${idx}`, true))}
          </div>
        </div>
      </div>
    </div>
  );
};
