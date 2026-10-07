'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Bookmark,
  MessageSquare,
  Sparkles,
  Play,
  Music,
  FileText,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { ShowcaseDiscoveryItem } from '../types/explore.types';
import { InteractionApiService } from '@/features/interactions/services/interaction.service';

interface ShowcaseDiscoveryCardProps {
  post: ShowcaseDiscoveryItem;
  onOpenComments?: (post: ShowcaseDiscoveryItem) => void;
}

export const ShowcaseDiscoveryCard: React.FC<ShowcaseDiscoveryCardProps> = ({
  post,
  onOpenComments,
}) => {
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [saved, setSaved] = useState(post.savedByMe ?? false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = prevLiked
        ? await InteractionApiService.unlikePost(post.id)
        : await InteractionApiService.likePost(post.id);

      if (!res.success) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;
    setIsSaving(true);

    const prevSaved = saved;
    setSaved(!prevSaved);

    try {
      const res = prevSaved
        ? await InteractionApiService.unsavePost(post.id)
        : await InteractionApiService.savePost(post.id);

      if (!res.success) {
        setSaved(prevSaved);
      }
    } catch {
      setSaved(prevSaved);
    } finally {
      setIsSaving(false);
    }
  };

  const primaryMedia = post.media && post.media.length > 0 ? post.media[0] : null;

  const renderPostTypeIcon = () => {
    switch (post.postType) {
      case 'VIDEO':
        return <Play className="w-3.5 h-3.5" />;
      case 'AUDIO':
        return <Music className="w-3.5 h-3.5" />;
      case 'TEXT':
        return <FileText className="w-3.5 h-3.5" />;
      case 'SHOWCASE':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300 group shadow-lg">
      <div>
        {/* Media Preview Area */}
        <div className="relative aspect-video w-full bg-[#12131A] overflow-hidden">
          {primaryMedia?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryMedia.thumbnailUrl || primaryMedia.url}
              alt={post.title || post.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white/5 to-white/[0.02] text-gray-500">
              {renderPostTypeIcon()}
              <span className="text-[10px] uppercase font-mono mt-2 tracking-wider">
                {post.postType} Showcase
              </span>
            </div>
          )}

          {/* Post Type Badge */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white flex items-center gap-1 border border-white/10">
            {renderPostTypeIcon()}
            <span>{post.postType}</span>
          </div>

          {/* Category Badge */}
          {post.category && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-400/20 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-amber-400/30">
              {post.category.name}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4">
          {/* Author Header */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 shrink-0">
              <div className="w-full h-full rounded-[6px] bg-[#12131A] overflow-hidden flex items-center justify-center text-[10px] font-bold text-amber-300">
                {post.author?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name || 'Author'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (post.author?.name || 'A').charAt(0)
                )}
              </div>
            </div>

            <div className="min-w-0">
              <Link
                href={
                  post.creatorProfile?.id
                    ? `/creator/${post.creatorProfile.id}`
                    : `/app`
                }
                className="text-xs font-semibold text-white hover:text-amber-300 transition-colors truncate block"
              >
                {post.creatorProfile?.stageName || post.author?.name || 'Creator'}
              </Link>
            </div>
          </div>

          {/* Post Title & Caption */}
          <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
            {post.title || post.caption}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">
            {post.caption}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          {/* Like */}
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              liked ? 'text-red-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={() => onOpenComments?.(post)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount ?? 0}</span>
          </button>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleToggleSave}
          className={`transition-colors ${
            saved ? 'text-amber-400 font-semibold' : 'hover:text-white'
          }`}
          title={saved ? 'Remove from Saved' : 'Save Post'}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};
