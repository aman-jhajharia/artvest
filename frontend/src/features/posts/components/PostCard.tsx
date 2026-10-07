'use client';

import React from 'react';
import Link from 'next/link';
import { PostItem } from '../types/post.types';
import { MediaGallery } from './MediaGallery';
import { TextPreview } from './TextPreview';
import {
  Sparkles,
  MapPin,
  Clock,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface PostCardProps {
  post: PostItem;
}

export function PostCard({ post }: PostCardProps) {
  const creator = post.creatorProfile;
  const author = post.author;
  const primaryCategory = post.category || creator?.primaryCategory;

  const displayName = creator?.stageName || author?.name || 'ArtVest Creator';
  const displayHeadline = creator?.headline || primaryCategory?.name || 'Creative Showcase';
  const displayAvatar = author?.avatarUrl || null;

  // Format relative published time
  const formatPublishedTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <article className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20">
      {/* Creator Header */}
      <div className="p-5 flex items-center justify-between gap-3 border-b border-white/5">
        <Link
          href={`/app/explore`}
          className="flex items-center gap-3 group min-w-0"
        >
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-11 h-11 rounded-full object-cover border border-white/20 group-hover:border-amber-400 transition-colors shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0 border border-white/20 group-hover:border-amber-400 transition-colors">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                {displayName}
              </span>
              {creator?.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
            </div>

            <p className="text-xs text-gray-400 truncate">{displayHeadline}</p>
          </div>
        </Link>

        {/* Location & Time */}
        <div className="flex flex-col items-end gap-1 text-[11px] font-mono text-gray-400 shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            {formatPublishedTime(post.publishedAt || post.createdAt)}
          </span>
          {creator?.location && (
            <span className="flex items-center gap-1 text-gray-500 truncate max-w-[120px]">
              <MapPin className="w-3 h-3 shrink-0" />
              {creator.location}
            </span>
          )}
        </div>
      </div>

      {/* Post Body: Title & Creative summary */}
      <div className="p-5 space-y-3">
        {post.title && (
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {post.title}
          </h2>
        )}

        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {post.caption}
        </p>

        {/* Extended Description */}
        {post.description && post.postType !== 'TEXT' && (
          <div className="text-xs text-gray-400 border-l-2 border-white/10 pl-3 py-1 font-mono leading-relaxed">
            {post.description}
          </div>
        )}
      </div>

      {/* Media Rendering */}
      <div className="px-5 pb-5">
        {post.postType === 'TEXT' ? (
          <TextPreview
            title={post.title}
            caption={post.caption}
            description={post.description}
          />
        ) : (
          <MediaGallery media={post.media} title={post.title || undefined} />
        )}
      </div>

      {/* Category, Skills & Tags */}
      <div className="px-5 pb-4 flex flex-wrap items-center gap-2">
        {primaryCategory && (
          <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-semibold">
            {primaryCategory.name}
          </span>
        )}

        {post.skills?.map((s) => (
          <span
            key={s.id}
            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-xs font-mono"
          >
            {s.name}
          </span>
        ))}

        {post.tags?.map((t) => (
          <span key={t} className="text-xs font-mono text-gray-400">
            #{t}
          </span>
        ))}
      </div>

      {/* Phase 4 Planned Interactions Footer (Explicitly marked future functionality) */}
      <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div
            title="Appreciation likes unlock in Phase 4"
            className="flex items-center gap-1.5 cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity"
          >
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-[11px]">Appreciate</span>
          </div>

          <div
            title="Community comments unlock in Phase 4"
            className="flex items-center gap-1.5 cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity"
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-[11px]">Discuss</span>
          </div>

          <div
            title="Portfolio bookmarks unlock in Phase 4"
            className="flex items-center gap-1.5 cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity"
          >
            <Bookmark className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-[11px]">Save</span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
          Phase 3 Showcase
        </span>
      </div>
    </article>
  );
}
