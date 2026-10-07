'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InteractionApiService } from '../services/interaction.service';
import { CommentItem } from '../types/interaction.types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  X,
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  Edit2,
  CornerDownRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CommentDrawerProps {
  postId: string;
  postTitle?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

export function CommentDrawer({
  postId,
  postTitle,
  isOpen,
  onClose,
  onCommentCountChange,
}: CommentDrawerProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await InteractionApiService.getComments(postId);
      if (res.success && res.data) {
        setComments(res.data);
        const count = res.totalComments ?? res.data.length;
        setTotalComments(count);
        onCommentCountChange?.(count);
      } else {
        setErrorMessage(res.message || 'Failed to load comments');
      }
    } catch {
      setErrorMessage('Network error loading discussion');
    } finally {
      setIsLoading(false);
    }
  }, [postId, onCommentCountChange]);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    } else {
      setReplyingTo(null);
      setEditingCommentId(null);
      setInputContent('');
    }
  }, [isOpen, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputContent.trim();
    if (!trimmed || isSubmitting) return;

    if (!user) {
      alert('Please log in to participate in creative discussions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await InteractionApiService.createComment(
        postId,
        trimmed,
        replyingTo ? replyingTo.id : null
      );

      if (res.success && res.data) {
        setInputContent('');
        setReplyingTo(null);
        await loadComments();
      } else {
        alert(res.message || 'Could not submit comment');
      }
    } catch {
      alert('Failed to send comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment: CommentItem) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    try {
      const res = await InteractionApiService.updateComment(commentId, trimmed);
      if (res.success) {
        setEditingCommentId(null);
        setEditContent('');
        await loadComments();
      } else {
        alert(res.message || 'Could not update comment');
      }
    } catch {
      alert('Error saving updated comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to remove this comment?')) return;

    try {
      const res = await InteractionApiService.deleteComment(commentId);
      if (res.success) {
        await loadComments();
      } else {
        alert(res.message || 'Could not delete comment');
      }
    } catch {
      alert('Error deleting comment');
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0c0f17] border-l border-white/10 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Creative Discussion ({totalComments})</span>
            </div>
            {postTitle && (
              <h3 className="text-sm font-bold text-white truncate mt-0.5">
                {postTitle}
              </h3>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment list scroll container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs font-mono">Loading thoughts & critiques...</p>
            </div>
          ) : errorMessage ? (
            <div className="py-12 text-center text-rose-400 text-xs space-y-2">
              <p>{errorMessage}</p>
              <button
                onClick={loadComments}
                className="text-amber-400 hover:underline font-mono"
              >
                Retry
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-20 text-center max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Thoughts Shared Yet</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Be the first collaborator or patron to share feedback, creative critique, or inspiration.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner = user?.id === comment.authorId;
              const isEditing = editingCommentId === comment.id;

              return (
                <div key={comment.id} className="space-y-3 group/comment">
                  {/* Top-level comment */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 bg-gradient-to-tr from-amber-500/20 to-purple-600/20 flex items-center justify-center text-xs font-bold text-white">
                      {comment.author.avatarUrl ? (
                        <img
                          src={comment.author.avatarUrl}
                          alt={comment.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.author.name.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-white truncate">
                            {comment.author.creatorProfile?.stageName || comment.author.name}
                          </span>
                          {comment.author.creatorProfile?.isVerified && (
                            <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-gray-500 shrink-0">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>

                      {/* Comment text or edit mode */}
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            maxLength={2000}
                            rows={2}
                            className="w-full p-2.5 rounded-xl bg-white/5 border border-amber-400/30 text-white text-xs focus:outline-none focus:border-amber-400 resize-none font-sans"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="text-[11px] font-mono text-gray-400 hover:text-white px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(comment.id)}
                              className="text-[11px] font-mono bg-amber-400 text-black font-bold px-3 py-1 rounded-lg hover:brightness-105"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      )}

                      {/* Action buttons */}
                      {!isEditing && (
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500 font-mono">
                          <button
                            onClick={() =>
                              setReplyingTo({
                                id: comment.id,
                                name:
                                  comment.author.creatorProfile?.stageName ||
                                  comment.author.name,
                              })
                            }
                            className="hover:text-amber-300 flex items-center gap-1 transition-colors"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            Reply
                          </button>

                          {isOwner && (
                            <button
                              onClick={() => handleStartEdit(comment)}
                              className="hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                          )}

                          {(isOwner || user?.role === 'ADMIN') && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nested replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="border-l-2 border-white/10 ml-4 pl-4 space-y-3 pt-1">
                      {comment.replies.map((reply) => {
                        const isReplyOwner = user?.id === reply.authorId;
                        const isReplyEditing = editingCommentId === reply.id;

                        return (
                          <div key={reply.id} className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/10 bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                              {reply.author.avatarUrl ? (
                                <img
                                  src={reply.author.avatarUrl}
                                  alt={reply.author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                reply.author.name.slice(0, 2).toUpperCase()
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[11px] font-bold text-white truncate">
                                  {reply.author.creatorProfile?.stageName || reply.author.name}
                                </span>
                                <span className="text-[9px] font-mono text-gray-500 shrink-0">
                                  {formatRelativeTime(reply.createdAt)}
                                </span>
                              </div>

                              {isReplyEditing ? (
                                <div className="mt-1 space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    maxLength={2000}
                                    rows={2}
                                    className="w-full p-2 rounded-lg bg-white/5 border border-amber-400/30 text-white text-xs focus:outline-none focus:border-amber-400 resize-none font-sans"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="text-[10px] font-mono text-gray-400 hover:text-white px-2 py-0.5"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveEdit(reply.id)}
                                      className="text-[10px] font-mono bg-amber-400 text-black font-bold px-2.5 py-0.5 rounded-md hover:brightness-105"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed whitespace-pre-wrap break-words">
                                  {reply.content}
                                </p>
                              )}

                              {!isReplyEditing && (
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 font-mono">
                                  {isReplyOwner && (
                                    <button
                                      onClick={() => handleStartEdit(reply)}
                                      className="hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                      Edit
                                    </button>
                                  )}

                                  {(isReplyOwner || user?.role === 'ADMIN') && (
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      className="hover:text-rose-400 flex items-center gap-1 transition-colors"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          {replyingTo && (
            <div className="flex items-center justify-between text-xs font-mono text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg mb-2">
              <span className="flex items-center gap-1 truncate">
                <CornerDownRight className="w-3 h-3 shrink-0" />
                Replying to <strong className="font-bold">{replyingTo.name}</strong>
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder={
                replyingTo
                  ? `Write a reply to ${replyingTo.name}...`
                  : 'Add a thought, critique, or observation...'
              }
              rows={2}
              maxLength={2000}
              className="flex-1 bg-white/5 border border-white/10 focus:border-amber-400/50 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none resize-none transition-colors"
            />

            <button
              type="submit"
              disabled={isSubmitting || !inputContent.trim()}
              className="h-10 px-4 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 transition-all shadow-md shadow-amber-400/20 shrink-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-gray-500">
            <span>Markdown supported for formatting</span>
            <span>{inputContent.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
