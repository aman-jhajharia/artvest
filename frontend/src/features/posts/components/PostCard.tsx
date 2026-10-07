'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PostItem } from '../types/post.types';
import { MediaGallery } from './MediaGallery';
import { TextPreview } from './TextPreview';
import { InteractionApiService } from '@/features/interactions/services/interaction.service';
import { CommentDrawer } from '@/features/interactions/components/CommentDrawer';
import { CollaborateModal } from '@/features/interactions/components/CollaborateModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  Sparkles,
  MapPin,
  Clock,
  Heart,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Handshake,
  UserPlus,
  UserCheck,
} from 'lucide-react';

interface PostCardProps {
  post: PostItem;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const creator = post.creatorProfile;
  const author = post.author;
  const primaryCategory = post.category || creator?.primaryCategory;

  const displayName = creator?.stageName || author?.name || 'ArtVest Creator';
  const displayHeadline = creator?.headline || primaryCategory?.name || 'Creative Showcase';
  const displayAvatar = author?.avatarUrl || null;
  const creatorIdentifier = creator?.id || post.creatorProfileId || post.authorId;
  const isOwnPost = user?.id === post.authorId;

  // Interaction States
  const [liked, setLiked] = useState<boolean>(post.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState<number>(post.likeCount ?? 0);
  const [saved, setSaved] = useState<boolean>(post.savedByMe ?? false);
  const [saveCount, setSaveCount] = useState<number>(post.saveCount ?? 0);
  const [commentCount, setCommentCount] = useState<number>(post.commentCount ?? 0);
  const [isFollowing, setIsFollowing] = useState<boolean>(post.followingCreator ?? false);

  // Modals & Drawers
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

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

  // Like / Unlike Toggle with optimistic UI & rollback
  const handleLikeToggle = async () => {
    if (!user) {
      alert('Please log in to appreciate creative work.');
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;

    if (previousLiked) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      try {
        const res = await InteractionApiService.unlikePost(post.id);
        if (res.success && res.data) {
          setLikeCount(res.data.count);
        } else {
          // Rollback
          setLiked(previousLiked);
          setLikeCount(previousCount);
        }
      } catch {
        setLiked(previousLiked);
        setLikeCount(previousCount);
      }
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      try {
        const res = await InteractionApiService.likePost(post.id);
        if (res.success && res.data) {
          setLikeCount(res.data.count);
        } else {
          // Rollback
          setLiked(previousLiked);
          setLikeCount(previousCount);
        }
      } catch {
        setLiked(previousLiked);
        setLikeCount(previousCount);
      }
    }
  };

  // Save / Unsave Toggle with optimistic UI & rollback
  const handleSaveToggle = async () => {
    if (!user) {
      alert('Please log in to save showcases to your bookmarks.');
      return;
    }

    const previousSaved = saved;
    const previousCount = saveCount;

    if (previousSaved) {
      setSaved(false);
      setSaveCount((c) => Math.max(0, c - 1));
      try {
        const res = await InteractionApiService.unsavePost(post.id);
        if (res.success && res.data) {
          setSaveCount(res.data.count);
        } else {
          setSaved(previousSaved);
          setSaveCount(previousCount);
        }
      } catch {
        setSaved(previousSaved);
        setSaveCount(previousCount);
      }
    } else {
      setSaved(true);
      setSaveCount((c) => c + 1);
      try {
        const res = await InteractionApiService.savePost(post.id);
        if (res.success && res.data) {
          setSaveCount(res.data.count);
        } else {
          setSaved(previousSaved);
          setSaveCount(previousCount);
        }
      } catch {
        setSaved(previousSaved);
        setSaveCount(previousCount);
      }
    }
  };

  // Follow / Unfollow Toggle
  const handleFollowToggle = async () => {
    if (!user) {
      alert('Please log in to follow creators.');
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      const res = previousState
        ? await InteractionApiService.unfollowCreator(creatorIdentifier)
        : await InteractionApiService.followCreator(creatorIdentifier);

      if (res.success && res.data) {
        setIsFollowing(res.data.following);
      } else {
        setIsFollowing(previousState);
      }
    } catch {
      setIsFollowing(previousState);
    }
  };

  return (
    <>
      <article className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20">
        {/* Creator Header */}
        <div className="p-5 flex items-center justify-between gap-3 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/creator/${creatorIdentifier}`}
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

            {/* Follow Button if not own post */}
            {!isOwnPost && (
              <button
                onClick={handleFollowToggle}
                className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1 shrink-0 ${
                  isFollowing
                    ? 'bg-white/10 text-gray-300 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10'
                    : 'bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black border border-amber-400/30'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

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

        {/* Phase 4 Social Graph & Creative Interactions Footer */}
        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-xs">
          {/* Likes, Comments, Saves */}
          <div className="flex items-center gap-5">
            {/* Appreciation (Like) Button */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 transition-colors group/like ${
                liked
                  ? 'text-rose-400 font-bold'
                  : 'text-gray-400 hover:text-rose-300'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform group-hover/like:scale-110 ${
                  liked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span className="font-mono text-xs">{likeCount}</span>
            </button>

            {/* Comment / Discuss Button */}
            <button
              onClick={() => setIsCommentDrawerOpen(true)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-amber-300 transition-colors group/comment"
            >
              <MessageSquare className="w-4 h-4 transition-transform group-hover/comment:scale-110" />
              <span className="font-mono text-xs">{commentCount}</span>
            </button>

            {/* Bookmark (Save) Button */}
            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-1.5 transition-colors group/save ${
                saved
                  ? 'text-amber-400 font-bold'
                  : 'text-gray-400 hover:text-amber-300'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 transition-transform group-hover/save:scale-110 ${
                  saved ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
              <span className="font-mono text-xs">{saveCount}</span>
            </button>
          </div>

          {/* Collaborate Action */}
          {!isOwnPost && (
            <button
              onClick={() => setIsCollabModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Collaborate</span>
            </button>
          )}
        </div>
      </article>

      {/* Discussion Drawer */}
      <CommentDrawer
        postId={post.id}
        postTitle={post.title || post.caption}
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        onCommentCountChange={(newCount) => setCommentCount(newCount)}
      />

      {/* Structured Collaboration Modal */}
      <CollaborateModal
        recipientId={creatorIdentifier}
        recipientName={displayName}
        postId={post.id}
        postTitle={post.title || post.caption}
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />
    </>
  );
}
