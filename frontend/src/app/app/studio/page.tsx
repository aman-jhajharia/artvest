'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PostItem } from '@/features/posts/types/post.types';
import { PostApiService } from '@/features/posts/services/post.service';
import { CreateShowcaseModal } from '@/features/posts/components/CreateShowcaseModal';
import { CollaborationInquiriesList } from '@/features/interactions/components/CollaborationInquiriesList';
import { StudioApiService } from '@/features/studio/services/studio.service';
import {
  StudioOverviewData,
  StudioPostPerformance,
} from '@/features/studio/types/studio.types';
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
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  Handshake,
  Heart,
  MessageSquare,
  Bookmark,
  Users,
  TrendingUp,
  BarChart3,
  Award,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
} from 'lucide-react';

type StudioTab = 'OVERVIEW' | 'PERFORMANCE' | 'PUBLISHED' | 'DRAFT' | 'FEATURED' | 'COLLABORATION';

export default function StudioPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StudioTab>('OVERVIEW');
  const [overviewData, setOverviewData] = useState<StudioOverviewData | null>(null);
  const [performancePosts, setPerformancePosts] = useState<StudioPostPerformance[]>([]);
  const [performanceSort, setPerformanceSort] = useState<'engagement' | 'likes' | 'comments' | 'saves' | 'views' | 'newest'>('engagement');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load Overview Data
  const loadOverview = useCallback(async () => {
    setIsOverviewLoading(true);
    try {
      const res = await StudioApiService.getOverview();
      if (res.success && res.data) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error('Failed to load studio overview:', err);
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  // Load Performance Posts
  const loadPerformance = useCallback(async () => {
    setIsPerformanceLoading(true);
    try {
      const res = await StudioApiService.getPostsPerformance({ sort: performanceSort, limit: 20 });
      if (res.success && res.data) {
        setPerformancePosts(res.data);
      }
    } catch (err) {
      console.error('Failed to load performance posts:', err);
    } finally {
      setIsPerformanceLoading(false);
    }
  }, [performanceSort]);

  // Load Post Management Data (Published, Drafts, Featured)
  const loadPosts = useCallback(async () => {
    if (activeTab === 'OVERVIEW' || activeTab === 'PERFORMANCE' || activeTab === 'COLLABORATION') {
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
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (activeTab === 'PERFORMANCE') {
      loadPerformance();
    } else if (activeTab === 'PUBLISHED' || activeTab === 'DRAFT' || activeTab === 'FEATURED') {
      loadPosts();
    }
  }, [activeTab, loadPerformance, loadPosts]);

  const handlePublish = async (postId: string) => {
    try {
      const res = await PostApiService.publishPost(postId);
      if (res.success) {
        setActionMessage('Post successfully published to showcase feed and portfolio!');
        setTimeout(() => setActionMessage(null), 4000);
        loadPosts();
        loadOverview();
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
        loadOverview();
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
        loadOverview();
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

  // Restrict Studio if user is not a creator
  if (user && user.role !== 'CREATOR') {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Creator Studio is Reserved for Creators</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          Creator Studio provides talent analytics, portfolio management, and collaboration
          inquiry pipelines. Complete your creator onboarding profile to unlock full access.
        </p>
        <Link
          href="/app/onboarding"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
        >
          <Sparkles className="w-4 h-4" />
          Complete Creator Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">Creator Studio</h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Phase 6 Active
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time analytics, showcase engagement, audience growth, and portfolio operations
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
          { id: 'OVERVIEW', label: 'Analytics Overview', icon: BarChart3 },
          { id: 'PERFORMANCE', label: 'Post Performance', icon: TrendingUp },
          { id: 'PUBLISHED', label: 'Published Work', icon: Layers },
          { id: 'DRAFT', label: 'Drafts', icon: Edit },
          { id: 'FEATURED', label: 'Featured Spotlight', icon: Star },
          { id: 'COLLABORATION', label: 'Collaboration Inquiries', icon: Handshake },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                isActive
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                  : 'bg-white/[0.02] text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. OVERVIEW TAB: ANALYTICS DASHBOARD                     */}
      {/* ======================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {isOverviewLoading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs font-mono text-gray-400">Loading creator analytics...</p>
            </div>
          ) : overviewData ? (
            <>
              {/* Top Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Posts */}
                <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Showcase Posts</span>
                    <Layers className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {overviewData.metrics.totalPosts}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">
                      {overviewData.metrics.publishedPosts} published
                    </span>
                    <span>•</span>
                    <span className="text-amber-400/80">
                      {overviewData.metrics.draftPosts} drafts
                    </span>
                  </div>
                </div>

                {/* 2. Total Engagement */}
                <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Total Engagement</span>
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {overviewData.metrics.totalEngagement}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-rose-300">
                      <Heart className="w-3 h-3" /> {overviewData.metrics.totalLikes}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-cyan-300">
                      <MessageSquare className="w-3 h-3" /> {overviewData.metrics.totalComments}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-indigo-300">
                      <Bookmark className="w-3 h-3" /> {overviewData.metrics.totalSaves}
                    </span>
                  </div>
                </div>

                {/* 3. Followers */}
                <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Creative Followers</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {overviewData.metrics.totalFollowers}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Direct creative network
                  </div>
                </div>

                {/* 4. Collaboration Inquiries & Acceptance Rate */}
                <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-medium">Collaboration Inquiries</span>
                    <Handshake className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {overviewData.collaboration.totalInquiries}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">
                      {overviewData.collaboration.acceptanceRate}% acceptance
                    </span>
                    <span>•</span>
                    <span>{overviewData.collaboration.pendingInquiries} pending</span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Creator Profile Snapshot & Collaboration Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview Card */}
                <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Creator Identity
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {overviewData.creator.isVerified && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        {overviewData.creator.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {overviewData.creator.stageName || 'Creator'}
                    </h2>
                    {overviewData.creator.headline && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {overviewData.creator.headline}
                      </p>
                    )}
                  </div>

                  {/* Primary Category & Skills */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="text-[11px] text-gray-400">
                      Primary Discipline:{' '}
                      <span className="text-amber-400 font-semibold">
                        {overviewData.creator.primaryCategory.name}
                      </span>
                    </div>
                    {overviewData.creator.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {overviewData.creator.skills.map((s) => (
                          <span
                            key={s.id}
                            className={`text-[10px] px-2 py-0.5 rounded-md border ${
                              s.isPrimary
                                ? 'bg-amber-400/10 text-amber-300 border-amber-400/30 font-bold'
                                : 'bg-white/5 text-gray-300 border-white/10'
                            }`}
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile Completion & Real Profile Views */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Profile Completion</span>
                      <span className="font-bold text-amber-400">
                        {overviewData.creator.profileCompletionScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${overviewData.creator.profileCompletionScore}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        Verified Profile Views
                      </span>
                      <span className="font-mono font-bold text-white">
                        {overviewData.creator.viewCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collaboration Funnel Breakdown */}
                <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Collaboration Funnel
                    </h3>
                    <Handshake className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-gray-300">Pending Review</div>
                      <div className="text-sm font-bold text-amber-400">
                        {overviewData.collaboration.pendingInquiries}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-gray-300">Accepted Projects</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {overviewData.collaboration.acceptedInquiries}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-gray-300">Declined</div>
                      <div className="text-sm font-bold text-gray-500">
                        {overviewData.collaboration.declinedInquiries}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>Acceptance Rate</span>
                      <span>{overviewData.collaboration.acceptanceRate}%</span>
                    </div>
                    <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                      Calculated from resolved inquiries (accepted ÷ total resolved).
                    </p>
                  </div>
                </div>

                {/* Recent Followers */}
                <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Recent Audience
                    </h3>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>

                  {overviewData.recentFollowers.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Users className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-xs text-gray-400">No followers yet.</p>
                      <p className="text-[11px] text-gray-500">
                        Publish showcases to attract peers across the creative ecosystem.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {overviewData.recentFollowers.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {f.avatarUrl ? (
                              <img
                                src={f.avatarUrl}
                                alt={f.name}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-stone-800 text-[10px] font-bold text-white flex items-center justify-center">
                                {f.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-white truncate">
                              {f.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(f.followedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Top Performing Works */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Top Performing Work</h3>
                    <p className="text-[11px] text-gray-400">
                      Deterministic ranking based on engagement score (Likes + Comments + Saves)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('PERFORMANCE')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    View All Performance <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {overviewData.topPosts.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-xs text-gray-400">No published showcases with engagement yet.</p>
                    <button
                      onClick={openCreateModal}
                      className="text-xs font-bold text-amber-400 hover:underline"
                    >
                      Publish your first showcase
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {overviewData.topPosts.map((post, idx) => (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-black flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-white truncate">
                            {post.title || post.caption}
                          </h4>
                          <p className="text-[11px] text-gray-400 truncate">
                            {post.caption}
                          </p>

                          <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-gray-400">
                            <span className="flex items-center gap-1 text-rose-300">
                              <Heart className="w-3 h-3" /> {post.likesCount}
                            </span>
                            <span className="flex items-center gap-1 text-cyan-300">
                              <MessageSquare className="w-3 h-3" /> {post.commentsCount}
                            </span>
                            <span className="flex items-center gap-1 text-indigo-300">
                              <Bookmark className="w-3 h-3" /> {post.savesCount}
                            </span>
                            <span className="ml-auto font-bold text-amber-400">
                              Score: {post.engagementScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              Unable to load overview analytics.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PERFORMANCE TAB: DETAILED ENGAGEMENT METRICS          */}
      {/* ======================================================== */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Showcase Engagement Breakdown</h3>
              <p className="text-[11px] text-gray-400">
                Transparent engagement scoring: Total Engagement = Likes + Comments + Saves
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Sort by:</span>
              <select
                value={performanceSort}
                onChange={(e) => setPerformanceSort(e.target.value as any)}
                className="bg-stone-900 border border-white/15 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
              >
                <option value="engagement">Engagement Score (Highest)</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
                <option value="saves">Saves</option>
                <option value="views">Views</option>
                <option value="newest">Recently Published</option>
              </select>
            </div>
          </div>

          {/* Posts Performance List */}
          {isPerformanceLoading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs font-mono text-gray-400">Calculating engagement statistics...</p>
            </div>
          ) : performancePosts.length === 0 ? (
            <div className="p-12 rounded-2xl glass-panel border border-white/10 text-center space-y-2">
              <p className="text-xs text-gray-400">No showcases found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {performancePosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                          {post.postType}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {post.status}
                        </span>
                        {post.isFeatured && (
                          <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" /> Featured
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                        {post.title || post.caption}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {post.caption}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="flex items-center gap-4 shrink-0 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-center min-w-12">
                      <div className="text-xs font-bold text-rose-300 flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3" /> {post.likesCount}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Likes</span>
                    </div>

                    <div className="text-center min-w-12">
                      <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {post.commentsCount}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Comments</span>
                    </div>

                    <div className="text-center min-w-12">
                      <div className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1">
                        <Bookmark className="w-3 h-3" /> {post.savesCount}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Saves</span>
                    </div>

                    <div className="text-center min-w-12">
                      <div className="text-xs font-bold text-gray-300 flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> {post.viewCount}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">Views</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-center min-w-24">
                      <div className="text-xs font-black text-amber-300 font-mono">
                        {post.engagementScore}
                      </div>
                      <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                        Engagement
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. COLLABORATION INQUIRIES TAB                           */}
      {/* ======================================================== */}
      {activeTab === 'COLLABORATION' && <CollaborationInquiriesList />}

      {/* ======================================================== */}
      {/* 4. CONTENT MANAGEMENT TABS: PUBLISHED, DRAFT, FEATURED   */}
      {/* ======================================================== */}
      {(activeTab === 'PUBLISHED' || activeTab === 'DRAFT' || activeTab === 'FEATURED') && (
        <>
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs font-mono text-gray-400">Loading your showcases...</p>
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
                              <Heart className="w-3 h-3 text-rose-400/80" />
                              {post.likeCount ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-cyan-400/80" />
                              {post.commentCount ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3 h-3 text-indigo-400/80" />
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
        </>
      )}

      {/* Create / Edit Modal */}
      <CreateShowcaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadPosts();
          loadOverview();
        }}
        initialPost={editingPost}
      />
    </div>
  );
}
