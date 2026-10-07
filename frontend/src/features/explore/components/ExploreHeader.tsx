'use client';

import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
  Users,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { CategoryOption, ExploreQueryParams } from '../types/explore.types';

interface ExploreHeaderProps {
  categories: CategoryOption[];
  filters: ExploreQueryParams;
  activeFilterCount: number;
  onFilterChange: (updates: Partial<ExploreQueryParams>) => void;
  onOpenMobileFilters: () => void;
  totalResults: number;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  categories,
  filters,
  activeFilterCount,
  onFilterChange,
  onOpenMobileFilters,
  totalResults,
}) => {
  const suggestedQueries = [
    'Classical Singer in Jaipur',
    'Cinematographer + Documentary + Mumbai',
    'Professional Photographer in Delhi',
    'Available Music Producer',
    '3D Artist + VFX',
  ];

  const activeTab = filters.tab || 'creators';

  return (
    <div className="space-y-4 mb-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Structured Talent Discovery</span>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
            Phase 5
          </span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Multi-attribute discovery by discipline, skill, location, experience, and availability
        </p>
      </div>

      {/* Structured Search Toolbar */}
      <div className="glass-panel rounded-2xl p-3.5 border border-white/10 space-y-3">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => onFilterChange({ q: e.target.value, page: 1 })}
            placeholder='Try searching: "Classical Singer in Jaipur", "Cinematographer + Mumbai", or "VFX"'
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => onFilterChange({ q: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-gray-400 scrollbar-none">
          <span className="text-[10px] uppercase font-semibold text-gray-500 shrink-0">
            Suggested:
          </span>
          {suggestedQueries.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onFilterChange({ q: sug, page: 1 })}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5 scrollbar-none">
          <button
            type="button"
            onClick={() => onFilterChange({ category: '', skill: '', page: 1 })}
            className={`text-xs px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              !filters.category
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
            }`}
          >
            All Disciplines
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                onFilterChange({
                  category: filters.category === cat.slug ? '' : cat.slug,
                  skill: '',
                  page: 1,
                })
              }
              className={`text-xs px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                filters.category === cat.slug
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-mono text-amber-400 mr-1">
            Active Filters ({activeFilterCount}):
          </span>

          {filters.category && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Category: {filters.category}
              <button
                type="button"
                onClick={() => onFilterChange({ category: '', skill: '', page: 1 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.skill && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Skill: {filters.skill}
              <button
                type="button"
                onClick={() => onFilterChange({ skill: '', page: 1 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.location && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
              City: {filters.location}
              <button
                type="button"
                onClick={() => onFilterChange({ location: '', page: 1 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.experience && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Level: {filters.experience}
              <button
                type="button"
                onClick={() => onFilterChange({ experience: '', page: 1 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.availability && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Availability: {filters.availability}
              <button
                type="button"
                onClick={() => onFilterChange({ availability: '', page: 1 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.proficiency && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Proficiency: {filters.proficiency}
              <button
                type="button"
                onClick={() => onFilterChange({ proficiency: '', page: 1 })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Tab Switcher (Creators vs Showcases) */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'creators', page: 1 })}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'creators'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Creators</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ tab: 'posts', page: 1 })}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Showcases</span>
          </button>
        </div>

        {/* Right side: Sort + Mobile Filter Trigger */}
        <div className="flex items-center gap-2.5">
          {/* Results Count */}
          <span className="text-xs text-gray-400 hidden sm:inline">
            Showing {totalResults} {activeTab === 'creators' ? 'creators' : 'showcases'}
          </span>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#12131A] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-gray-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filters.sort || 'relevance'}
              onChange={(e) => onFilterChange({ sort: e.target.value, page: 1 })}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="relevance" className="bg-[#12131A] text-white">
                Sort: Relevance
              </option>
              <option value="profile_strength" className="bg-[#12131A] text-white">
                Sort: Profile Strength
              </option>
              <option value="newest" className="bg-[#12131A] text-white">
                Sort: Newest
              </option>
              <option value="popular" className="bg-[#12131A] text-white">
                Sort: Most Popular
              </option>
            </select>
          </div>

          {/* Mobile Filter Sheet Trigger */}
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
