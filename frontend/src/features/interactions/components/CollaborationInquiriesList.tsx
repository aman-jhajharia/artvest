'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InteractionApiService } from '../services/interaction.service';
import { CollaborationInquiryItem, InquiryStatus } from '../types/interaction.types';
import {
  Handshake,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Clock,
  Bookmark,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function CollaborationInquiriesList() {
  const [activeTab, setActiveTab] = useState<'RECEIVED' | 'SENT'>('RECEIVED');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inquiries, setInquiries] = useState<CollaborationInquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = statusFilter !== 'ALL' ? (statusFilter as InquiryStatus) : undefined;
      const res =
        activeTab === 'RECEIVED'
          ? await InteractionApiService.getReceivedInquiries(1, 30, statusParam)
          : await InteractionApiService.getSentInquiries(1, 30, statusParam);

      if (res.success && res.data) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to load collaboration inquiries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleUpdateStatus = async (inquiryId: string, status: InquiryStatus) => {
    setProcessingId(inquiryId);
    try {
      const res = await InteractionApiService.updateInquiryStatus(inquiryId, status);
      if (res.success) {
        setActionFeedback(`Inquiry status updated to ${status.toLowerCase()}`);
        setTimeout(() => setActionFeedback(null), 3000);
        await loadInquiries();
      } else {
        alert(res.message || 'Failed to update inquiry status');
      }
    } catch {
      alert('Error updating status');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-mono font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-xs font-mono font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Accepted
          </span>
        );
      case 'DECLINED':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-rose-400/10 text-rose-400 border border-rose-400/20 text-xs font-mono font-semibold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs font-mono font-semibold flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Withdrawn
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Main Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('RECEIVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'RECEIVED'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Received Inquiries
          </button>
          <button
            onClick={() => setActiveTab('SENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SENT'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Sent Inquiries
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
          >
            <option value="ALL" className="bg-[#0e121c]">All Statuses</option>
            <option value="PENDING" className="bg-[#0e121c]">Pending</option>
            <option value="ACCEPTED" className="bg-[#0e121c]">Accepted</option>
            <option value="DECLINED" className="bg-[#0e121c]">Declined</option>
            <option value="WITHDRAWN" className="bg-[#0e121c]">Withdrawn</option>
          </select>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          ✓ {actionFeedback}
        </div>
      )}

      {/* Inquiries Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <p className="text-xs font-mono">Loading collaboration inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
            <Handshake className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">
            {activeTab === 'RECEIVED' ? 'No Received Inquiries' : 'No Sent Inquiries'}
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            {activeTab === 'RECEIVED'
              ? 'When fellow creatives or directors explore your showcases and wish to team up, their structured inquiries will appear here.'
              : 'You have not sent any collaboration inquiries yet. Browse the Showcase Feed or Explore Talent to connect with creators.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {inquiries.map((inquiry) => {
            const isReceived = activeTab === 'RECEIVED';
            const person = isReceived ? inquiry.sender : inquiry.recipient;
            const personName =
              person?.creatorProfile?.stageName || person?.name || 'ArtVest Creator';
            const personHeadline =
              person?.creatorProfile?.headline || person?.role || 'Creator';
            const isProcessing = processingId === inquiry.id;

            return (
              <div
                key={inquiry.id}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all space-y-4"
              >
                {/* Header: Person + Status + Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-gradient-to-tr from-amber-500/20 to-purple-600/20 flex items-center justify-center text-sm font-bold text-white">
                      {person?.avatarUrl ? (
                        <img
                          src={person.avatarUrl}
                          alt={personName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        personName.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-gray-500">
                          {isReceived ? 'From:' : 'To:'}
                        </span>
                        <span className="text-sm font-bold text-white truncate">
                          {personName}
                        </span>
                        {person?.creatorProfile?.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{personHeadline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(inquiry.status)}
                    <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(inquiry.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Referenced Post (if present) */}
                {inquiry.post && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">
                        Inspiration / Referenced Work
                      </span>
                      <p className="text-xs font-semibold text-white truncate">
                        {inquiry.post.title || inquiry.post.caption}
                      </p>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap break-words font-sans">
                  {inquiry.message}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  {isReceived && inquiry.status === 'PENDING' && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(inquiry.id, 'DECLINED')}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(inquiry.id, 'ACCEPTED')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-400 text-black text-xs font-mono font-bold hover:brightness-105 transition-all shadow-md shadow-emerald-400/20 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Accept Inquiry
                      </button>
                    </>
                  )}

                  {!isReceived && inquiry.status === 'PENDING' && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(inquiry.id, 'WITHDRAWN')}
                      className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-rose-400/30 text-gray-400 hover:text-rose-300 hover:bg-rose-500/5 text-xs font-mono transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      Withdraw Inquiry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
