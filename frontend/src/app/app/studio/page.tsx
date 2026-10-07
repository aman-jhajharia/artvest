'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PostItem, PostStatus } from '@/features/posts/types/post.types';
import { PostApiService } from '@/features/posts/services/post.service';
import { CreateShowcaseModal } from '@/features/posts/components/CreateShowcaseModal';
import { CollaborationInquiriesList } from '@/features/interactions/components/CollaborationInquiriesList';
import {
  Sparkles,
  PlusCircle,
  Star,
  Trash2,
  Edit,
  Send,
  Loader2,
  Clock,
  Eye,
  Layers,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  CheckCircle,
  Handshake,
  Heart,
  MessageSquare,
  Bookmark,
} from 'lucide-react';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'PUBLISHED' | 'DRAFT' | 'FEATURED' | 'COLLABORATION'>('PUBLISHED');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (activeTab === 'COLLABORATION') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let queryParams: any = {};
      if (activeTab === 'FEATURED') {
        queryParams.status = 'PUBLISHED';
        queryParams.isFeatured = true;
      } else {
        queryParams.status = activeTab;
      }

      const res = await PostApiService.getCreatorPosts(queryParams);
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Failed to load studio posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePublish = async (postId: string) => {
    try {
      const res = await PostApiService.publishPost(postId);
      if (res.success) {
        setActionMessage('Post successfully published to showcase feed and portfolio!');
        setTimeout(() => setActionMessage(null), 4000);
        loadPosts();
      } else {
        alert(res.message || res.error?.details || 'Failed to publish post');
      }
    } catch (err: any) {
      alert(err.message || 'Error publishing post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this showcase?')) return;
    try {
      const res = await PostApiService.deletePost(postId);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setActionMessage('Showcase deleted successfully.');
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting post');
    }
  };

  const handleToggleFeature = async (postId: string, currentFeatured: boolean) => {
    try {
      const nextFeatured = !currentFeatured;
      const res = await PostApiService.setFeatured(postId, nextFeatured);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isFeatured: nextFeatured } : p))
        );
        setActionMessage(
          nextFeatured
            ? 'Showcase is now featured at the top of your portfolio!'
            : 'Showcase unfeatured from portfolio spotlight.'
        );
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating featured status');
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const openEditModal = (post: PostItem) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return Film;
      case 'AUDIO':
        return Music;
      case 'TEXT':
        return FileText;
      case 'IMAGE':
      default:
        return ImageIcon;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">Creator Content Studio</h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Phase 3
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage your creative portfolio showcases, unpublished drafts, and featured spotlight works
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-black text-xs font-bold shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Showcase</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'PUBLISHED', label: 'Published Work' },
          { id: 'DRAFT', label: 'Drafts' },
          { id: 'FEATURED', label: 'Featured Spotlight' },
          { id: 'COLLABORATION', label: 'Collaboration Inquiries' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                : 'bg-white/[0.02] text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      {activeTab === 'COLLABORATION' ? (
        <CollaborationInquiriesList />
      ) : isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs font-mono text-gray-400">Loading your creative works...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const MediaIcon = getMediaIcon(post.postType);
            const firstMedia = post.media && post.media[0];

            return (
              <div
                key={post.id}
                className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all group"
              >
                <div>
                  {/* Media Thumbnail */}
                  <div className="h-44 bg-black/60 relative overflow-hidden flex items-center justify-center">
                    {firstMedia?.url ? (
                      firstMedia.mediaType === 'IMAGE' ? (
                        <img
                          src={firstMedia.thumbnailUrl || firstMedia.url}
                          alt={post.title || 'Showcase'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : firstMedia.mediaType === 'VIDEO' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-purple-950/40 text-purple-300">
                          <Film className="w-8 h-8" />
                          <span className="text-[10px] font-mono">Video Reel</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-amber-950/40 text-amber-300">
                          <Music className="w-8 h-8" />
                          <span className="text-[10px] font-mono">Audio Stem</span>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-500">
                        <MediaIcon className="w-8 h-8" />
                        <span className="text-[10px] font-mono">{post.postType}</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-md border ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {post.status}
                    </span>

                    {/* Featured star toggle */}
                    <button
                      type="button"
                      title={post.isFeatured ? 'Unfeature work' : 'Feature work in portfolio'}
                      onClick={() => handleToggleFeature(post.id, post.isFeatured)}
                      className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                        post.isFeatured
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-black/60 text-gray-400 border-white/20 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${post.isFeatured ? 'fill-black' : ''}`} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                        <MediaIcon className="w-3 h-3 text-amber-400" />
                        {post.postType}
                      </span>
                      {post.category && (
                        <span className="text-[10px] font-mono text-gray-400 truncate">
                          {post.category.name}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                      {post.title || 'Untitled Showcase'}
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>

                    {post.status === 'PUBLISHED' && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-gray-500" />
                          {post.likeCount ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-gray-500" />
                          {post.commentCount ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-3 h-3 text-gray-500" />
                          {post.saveCount ?? 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {post.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => handlePublish(post.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Publish</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditModal(post)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title="Edit showcase"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
                      title="Delete showcase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">
              {activeTab === 'DRAFT'
                ? 'No drafts yet.'
                : activeTab === 'FEATURED'
                ? 'No featured work yet.'
                : 'Add your first creative work.'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {activeTab === 'DRAFT'
                ? 'When you start building a showcase, you can save unfinished work here as a draft.'
                : activeTab === 'FEATURED'
                ? 'Toggle the star icon on any published showcase to highlight it at the top of your public portfolio.'
                : 'Upload visual art, audio stems, video reels, or literary scripts to begin building your ArtVest portfolio.'}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 shadow-md shadow-amber-400/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Showcase</span>
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreateShowcaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadPosts()}
        initialPost={editingPost}
      />
    </div>
  );
}
