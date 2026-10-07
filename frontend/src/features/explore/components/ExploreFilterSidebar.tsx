'use client';

import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  X,
  MapPin,
  Sparkles,
  Layers,
  Award,
  Clock,
  Check,
} from 'lucide-react';
import { CategoryOption, SkillOption, ExploreQueryParams } from '../types/explore.types';

interface ExploreFilterSidebarProps {
  categories: CategoryOption[];
  skills: SkillOption[];
  filters: ExploreQueryParams;
  onFilterChange: (updates: Partial<ExploreQueryParams>) => void;
  onResetFilters: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ExploreFilterSidebar: React.FC<ExploreFilterSidebarProps> = ({
  categories,
  skills,
  filters,
  onFilterChange,
  onResetFilters,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const popularCities = ['Jaipur', 'Mumbai', 'Delhi', 'Bengaluru'];

  const experienceOptions = [
    { label: 'All Levels', value: '' },
    { label: 'Beginner', value: 'BEGINNER' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced', value: 'ADVANCED' },
    { label: 'Professional', value: 'PROFESSIONAL' },
    { label: 'Veteran', value: 'VETERAN' },
  ];

  const availabilityOptions = [
    { label: 'All Availabilities', value: '' },
    { label: 'Available to Collab', value: 'AVAILABLE_FOR_COLLAB' },
    { label: 'Open to Work', value: 'OPEN_TO_WORK' },
    { label: 'Freelance', value: 'FREELANCE' },
    { label: 'Commissions', value: 'COMMISSION' },
  ];

  const proficiencyOptions = [
    { label: 'All Proficiencies', value: '' },
    { label: 'Beginner', value: 'BEGINNER' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced', value: 'ADVANCED' },
    { label: 'Expert', value: 'EXPERT' },
  ];

  // Filter skills based on selected category if category is active
  const filteredSkills = filters.category
    ? skills.filter((sk) => {
        const cat = categories.find(
          (c) => c.slug === filters.category || c.id === filters.category
        );
        return cat ? sk.categoryId === cat.id : true;
      })
    : skills;

  const content = (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>Structured Filters</span>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-1"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
          Creative Discipline
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ category: e.target.value, skill: '', page: 1 })}
          className="w-full bg-[#12131A] text-gray-200 border border-white/10 rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-amber-400 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Skill / Role Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
          Skill / Craft Role
        </label>
        <select
          value={filters.skill || ''}
          onChange={(e) => onFilterChange({ skill: e.target.value, page: 1 })}
          className="w-full bg-[#12131A] text-gray-200 border border-white/10 rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-amber-400 transition-colors"
        >
          <option value="">All Skills</option>
          {filteredSkills.map((sk) => (
            <option key={sk.id} value={sk.name}>
              {sk.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Location Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
          Location
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => onFilterChange({ location: e.target.value, page: 1 })}
            placeholder="City (e.g. Jaipur, Mumbai)"
            className="w-full pl-8.5 pr-3 py-2 bg-[#12131A] text-gray-200 border border-white/10 rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        {/* Quick city pills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {popularCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() =>
                onFilterChange({
                  location: filters.location?.toLowerCase() === city.toLowerCase() ? '' : city,
                  page: 1,
                })
              }
              className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                filters.location?.toLowerCase() === city.toLowerCase()
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Experience Level Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
          Experience Level
        </label>
        <div className="space-y-1">
          {experienceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange({ experience: opt.value, page: 1 })}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                (filters.experience || '') === opt.value
                  ? 'bg-amber-400/10 text-amber-300 font-semibold border border-amber-400/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <span>{opt.label}</span>
              {(filters.experience || '') === opt.value && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Availability Status Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
          Availability
        </label>
        <div className="space-y-1">
          {availabilityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange({ availability: opt.value, page: 1 })}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                (filters.availability || '') === opt.value
                  ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <span>{opt.label}</span>
              {(filters.availability || '') === opt.value && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Skill Proficiency Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
          Minimum Proficiency
        </label>
        <select
          value={filters.proficiency || ''}
          onChange={(e) => onFilterChange({ proficiency: e.target.value, page: 1 })}
          className="w-full bg-[#12131A] text-gray-200 border border-white/10 rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-amber-400 transition-colors"
        >
          {proficiencyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 glass-panel rounded-2xl p-5 border border-white/10 h-fit sticky top-24">
        {content}
      </aside>

      {/* Mobile Drawer / Sheet */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />

          {/* Drawer Slide-over */}
          <div className="relative ml-auto w-full max-w-xs bg-[#0C0D14] border-l border-white/10 h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="font-bold text-white text-sm">Filters</span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {content}
            </div>

            <div className="pt-6 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-black text-xs shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
