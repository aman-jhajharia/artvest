'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InteractionApiService } from '../services/interaction.service';
import { CollaborationChatData, CollaborationMessageItem } from '../types/interaction.types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface CollaborationChatDrawerProps {
  inquiryId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CollaborationChatDrawer({
  inquiryId,
  isOpen,
  onClose,
}: CollaborationChatDrawerProps) {
  const { user } = useAuth();
  const [chatData, setChatData] = useState<CollaborationChatData | null>(null);
  const [messages, setMessages] = useState<CollaborationMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  const loadMessages = useCallback(
    async (silent = false) => {
      if (!inquiryId) return;
      if (!silent) setIsLoading(true);

      try {
        const res = await InteractionApiService.getInquiryMessages(inquiryId);
        if (res.success && res.data) {
          setChatData(res.data);
          setMessages(res.data.messages || []);
          setErrorMessage(null);
        } else if (!silent) {
          setErrorMessage(res.message || 'Could not load conversation');
        }
      } catch {
        if (!silent) {
          setErrorMessage('Network error loading messages');
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [inquiryId]
  );

  // Initial load & Polling (3 seconds interval when tab is visible)
  useEffect(() => {
    if (!isOpen || !inquiryId) return;

    let isMounted = true;
    loadMessages(false).then(() => {
      if (isMounted) {
        setTimeout(() => scrollToBottom(false), 100);
      }
    });

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadMessages(true);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, inquiryId, loadMessages, scrollToBottom]);

  // Scroll to bottom when message count increments
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || isSending || !inquiryId) return;

    setIsSending(true);
    try {
      const res = await InteractionApiService.sendInquiryMessage(inquiryId, content);
      if (res.success && res.data) {
        setInputText('');
        setMessages((prev) => [...prev, res.data!]);
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        alert(res.message || 'Failed to send message');
      }
    } catch {
      alert('Error sending message');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  // Determine peer user details
  const isSender = user?.id === chatData?.inquiry.senderId;
  const peerUser = isSender ? chatData?.inquiry.recipient : chatData?.inquiry.sender;
  const peerHeadline = peerUser?.creatorProfile?.headline || peerUser?.creatorProfile?.stageName;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0c0f17] border-l border-white/10 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            {peerUser?.avatarUrl ? (
              <img
                src={peerUser.avatarUrl}
                alt={peerUser.name || 'Collaborator'}
                className="w-10 h-10 rounded-full object-cover border border-amber-400/30 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-sm shrink-0">
                {peerUser?.name?.charAt(0) || 'C'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  {peerUser?.name || 'Collaboration Partner'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Active
                </span>
              </div>
              {peerHeadline && (
                <p className="text-xs text-gray-400 truncate">{peerHeadline}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Accepted Inquiry Context Banner */}
        {chatData?.inquiry.message && (
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 text-xs text-gray-300">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Original Collaboration Pitch</span>
            </div>
            <p className="italic text-gray-300 line-clamp-2 pl-5 text-[11px] leading-relaxed border-l-2 border-amber-500/40">
              &ldquo;{chatData.inquiry.message}&rdquo;
            </p>
          </div>
        )}

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-gray-400 py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs font-mono">Loading conversation...</p>
            </div>
          ) : errorMessage ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-300 max-w-xs">{errorMessage}</p>
              <button
                onClick={() => loadMessages(false)}
                className="text-xs text-amber-400 hover:underline font-mono"
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">Collaboration Accepted!</h4>
              <p className="text-xs text-gray-400 max-w-xs">
                Your collaboration was accepted. Send a message to coordinate creative milestones, scheduling, and project files.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 text-xs leading-relaxed break-words whitespace-pre-wrap ${
                      isMine
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-white rounded-2xl rounded-tr-sm shadow-sm'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 px-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 border-t border-white/10 bg-white/[0.02]">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Press Enter to send)"
              maxLength={2000}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 resize-none font-sans min-h-[42px] max-h-32 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="h-[42px] px-4 rounded-xl bg-amber-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:brightness-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:brightness-100 disabled:active:scale-100 shrink-0 font-mono shadow-md shadow-amber-400/20"
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
          <p className="text-[10px] text-gray-500 font-mono mt-1.5 px-1">
            Shift + Enter for new line • Live thread polling every 3s
          </p>
        </div>
      </div>
    </div>
  );
}
