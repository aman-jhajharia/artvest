'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreativeProjectItem, Category } from '@/types';
import { ProjectApiService } from '@/features/projects/services/project.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProjectDetailsModal } from '@/features/projects/components/ProjectDetailsModal';
import { InvestProjectModal } from '@/features/projects/components/InvestProjectModal';
import { LaunchProjectModal } from '@/features/projects/components/LaunchProjectModal';
import { API_BASE_URL } from '@/config/api';
import {
  FolderGit2,
  Coins,
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  CheckCircle,
  Users,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';

function ProjectsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<CreativeProjectItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'OPEN' | 'FUNDED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(queryProjectId);
  const [isDetailsOpen, setIsDetailsOpen] = useState(Boolean(queryProjectId));
  const [investProject, setInvestProject] = useState<CreativeProjectItem | null>(null);
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);

  // Sync if queryProjectId changes
  useEffect(() => {
    if (queryProjectId) {
      setSelectedProjectId(queryProjectId);
      setIsDetailsOpen(true);
    }
  }, [queryProjectId]);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch {
        // catch silently
      }
    };
    fetchCats();
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ProjectApiService.listProjects({
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        limit: 30,
      });

      if (res.success && res.data) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="glass-panel border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>Fractional Creative Crowdfunding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Community Creative Pitches
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Back visionary creators and emerging producers with demo ArtCredits. Acquire fractional royalty and equity shares in music albums, indie films, dance suites, and design projects.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user?.role === 'CREATOR' && (
              <button
                onClick={() => setIsLaunchOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4 font-bold" />
                <span>Pitch a Project</span>
              </button>
            )}
            <a
              href="/app/wallet"
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center gap-2 transition-colors"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>My Portfolio & Wallet</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Pitches
          </button>
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'OPEN'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Open for Backing
          </button>
          <button
            onClick={() => setStatusFilter('FUNDED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'FUNDED'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            100% Funded
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pitches..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all" className="bg-[#12131C]">
              All Categories
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug} className="bg-[#12131C]">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs text-gray-400">Loading creative pitches...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <FolderGit2 className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No creative projects found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters or search keywords.'
              : 'Be the first creator to pitch an ambitious creative project to our community!'}
          </p>
          {user?.role === 'CREATOR' && (
            <button
              onClick={() => setIsLaunchOpen(true)}
              className="mt-2 py-2 px-4 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md hover:bg-amber-300 transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Pitch First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-panel border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col group"
            >
              {/* Media Header */}
              <div
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setIsDetailsOpen(true);
                }}
                className="h-44 w-full relative cursor-pointer overflow-hidden bg-black/40"
              >
                {project.coverMediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.coverMediaUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-900/40 to-black flex items-center justify-center text-gray-600">
                    <FolderGit2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-white/10">
                    {project.category?.name || 'Creative'}
                  </span>
                  {project.status === 'FUNDED' ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-black font-mono flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Funded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/80 backdrop-blur-md text-white font-mono">
                      Open
                    </span>
                  )}
                </div>

                {/* Creator Chip */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  {project.creator?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.creator.avatarUrl}
                      alt={project.creator.name}
                      className="w-6 h-6 rounded-full border border-white/20 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                      {project.creator?.name?.slice(0, 1) || 'C'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-white drop-shadow truncate">
                    {project.creator?.creatorProfile?.stageName || project.creator?.name}
                  </span>
                  {project.creator?.creatorProfile?.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setIsDetailsOpen(true);
                    }}
                    className="text-base font-bold text-white hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
                  >
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Progress Metric */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Raised</span>
                    <span className="font-bold text-white font-mono">
                      {project.amountRaised.toLocaleString()} / {project.fundingGoal.toLocaleString()} AC
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, project.fundingProgressPercentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-bold text-amber-400 font-mono">
                      {project.fundingProgressPercentage.toFixed(1)}% Funded
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Users className="w-3 h-3 text-gray-400" />
                      {project.backersCount} {project.backersCount === 1 ? 'backer' : 'backers'}
                    </span>
                  </div>
                </div>

                {/* User Holding Badge */}
                {project.currentUserInvestment && (
                  <div className="py-1 px-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-300 flex items-center justify-between">
                    <span>Your Holding:</span>
                    <span className="font-mono font-bold">
                      {project.currentUserInvestment.sharesAcquired.toLocaleString()} shares ({project.currentUserInvestment.sharePercentage}%)
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setIsDetailsOpen(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-semibold border border-white/5 transition-colors text-center"
                  >
                    Cap Table
                  </button>

                  {project.status === 'OPEN' && (
                    <button
                      onClick={() => setInvestProject(project)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-md shadow-amber-500/10 transition-all flex items-center justify-center gap-1"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Back (500+)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details & Cap Table Modal */}
      <ProjectDetailsModal
        projectId={selectedProjectId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedProjectId(null);
        }}
        onInvested={() => {
          fetchProjects();
        }}
      />

      {/* Interactive Invest Modal */}
      {investProject && (
        <InvestProjectModal
          project={investProject}
          isOpen={Boolean(investProject)}
          onClose={() => setInvestProject(null)}
          onSuccess={() => {
            fetchProjects();
          }}
        />
      )}

      {/* Creator Launch Modal */}
      <LaunchProjectModal
        isOpen={isLaunchOpen}
        onClose={() => setIsLaunchOpen(false)}
        onCreated={() => {
          fetchProjects();
        }}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs text-gray-400">Loading ArtVest Projects...</p>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
