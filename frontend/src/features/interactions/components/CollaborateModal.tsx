'use client';

import React, { useState } from 'react';
import { InteractionApiService } from '../services/interaction.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  X,
  Handshake,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  Bookmark,
} from 'lucide-react';

interface CollaborateModalProps {
  recipientId: string;
  recipientName: string;
  postId?: string | null;
  postTitle?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CollaborateModal({
  recipientId,
  recipientName,
  postId,
  postTitle,
  isOpen,
  onClose,
  onSuccess,
}: CollaborateModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();

    if (trimmed.length < 10) {
      setErrorMessage('Please provide at least 10 characters explaining your collaboration idea.');
      return;
    }

    if (!user) {
      alert('Please log in to send a collaboration inquiry.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await InteractionApiService.createInquiry(
        recipientId,
        trimmed,
        postId || undefined
      );

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setMessage('');
          onSuccess?.();
          onClose();
        }, 2200);
      } else {
        setErrorMessage(res.message || res.error?.code || 'Failed to send collaboration inquiry');
      }
    } catch {
      setErrorMessage('Network error sending inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0e121c] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Collaboration Inquiry Sent!</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Your structured inquiry was delivered to <strong className="text-amber-300">{recipientName}</strong>.
              They will review your project concept in their Studio.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold">
                <Handshake className="w-4 h-4" />
                <span>Creative Collaboration</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Interested in collaborating?
              </h2>
              <p className="text-xs text-gray-400">
                Send a structured inquiry to <span className="text-amber-300 font-semibold">{recipientName}</span> to discuss joint creative projects, production, or skill sharing.
              </p>
            </div>

            {/* Referenced Work indicator if present */}
            {postTitle && (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Referenced Creative Work
                  </span>
                  <span className="text-xs font-bold text-white truncate block">
                    {postTitle}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-gray-300 flex items-center justify-between">
                  <span>Your Collaboration Message</span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    {message.length}/2000 (min 10)
                  </span>
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={`Hi ${recipientName}, I saw your creative work and would love to collaborate on...`}
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors leading-relaxed resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || message.trim().length < 10}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
