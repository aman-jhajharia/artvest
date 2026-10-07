'use client';

import React from 'react';
import { SearchX, RotateCcw, Sparkles } from 'lucide-react';
import { ExploreQueryParams } from '../types/explore.types';

interface ExploreEmptyStateProps {
  filters: ExploreQueryParams;
  onResetFilters: () => void;
}

export const ExploreEmptyState: React.FC<ExploreEmptyStateProps> = ({
  filters,
  onResetFilters,
}) => {
  const getContextualMessage = () => {
    const parts: string[] = [];
    if (filters.skill) parts.push(`skill "${filters.skill}"`);
    if (filters.location) parts.push(`in "${filters.location}"`);
    if (filters.category) parts.push(`under category "${filters.category}"`);
    if (filters.experience) parts.push(`at "${filters.experience}" level`);
    if (filters.q) parts.push(`matching "${filters.q}"`);

    if (parts.length > 0) {
      return `No creative talent found with ${parts.join(' ')}.`;
    }

    return 'No results found matching your current filter criteria.';
  };

  return (
    <div className="glass-card rounded-2xl p-10 border border-white/10 text-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">No Matches Found</h3>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        {getContextualMessage()}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </button>
      </div>
    </div>
  );
};
