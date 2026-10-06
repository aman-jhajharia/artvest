'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, Trophy, ArrowRight } from 'lucide-react';
import { ProfileCompletionBreakdown } from '../types/creator.types';

interface ProfileStrengthCardProps {
  breakdown?: ProfileCompletionBreakdown | null;
  onActionClick?: () => void;
}

export function ProfileStrengthCard({ breakdown, onActionClick }: ProfileStrengthCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!breakdown) return null;

  const { score, checklist, missingItems, rank } = breakdown;

  const getRankColor = () => {
    switch (rank) {
      case 'Master Portfolio':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'Established Creator':
        return 'text-purple-300 bg-purple-500/10 border-purple-500/30';
      case 'Active Creative':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getProgressGradient = () => {
    if (score >= 90) return 'from-amber-500 to-yellow-400';
    if (score >= 70) return 'from-purple-500 to-indigo-400';
    if (score >= 40) return 'from-blue-500 to-cyan-400';
    return 'from-emerald-500 to-teal-400';
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-white/20">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Profile Strength</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getRankColor()}`}>
              <Trophy className="w-3 h-3 inline mr-1" />
              {rank}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{score}% Completed</span>
            {score === 100 && <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />}
          </h3>
        </div>

        {missingItems.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors"
          >
            <span>{missingItems.length} recommendations</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient()} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Next Best Action Banner */}
      {missingItems.length > 0 ? (
        <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300 mb-2">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold mt-0.5">Tip:</span>
            <span>{missingItems[0]}</span>
          </div>
          {onActionClick && (
            <button
              onClick={onActionClick}
              className="text-amber-300 hover:underline flex items-center gap-1 font-semibold whitespace-nowrap shrink-0"
            >
              Complete Now <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Outstanding! Your creator profile is at full strength and primed for discovery.
        </p>
      )}

      {/* Detailed Checklist Accordion */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border flex items-start gap-2.5 transition-all ${
                item.completed
                  ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-gray-300'
                  : 'bg-white/[0.02] border-white/5 text-gray-400'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${item.completed ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                    +{item.points}%
                  </span>
                </div>
                {!item.completed && <p className="text-[11px] text-gray-500 mt-0.5">{item.tip}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
