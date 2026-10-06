'use client';

import React from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Film,
  Music,
  PlusCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { PortfolioItem } from '../types/creator.types';

interface PortfolioSectionProps {
  portfolio?: PortfolioItem[];
  isOwner?: boolean;
}

export function PortfolioSection({ portfolio = [], isOwner = false }: PortfolioSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Portfolio & Showcases</h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Phase 2 Foundation
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Curated featured works, audio stems, showreels, and creative project milestones
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              disabled
              title="Full multimedia posting unlocks in Phase 3"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Publish Showcase (Phase 3)</span>
            </button>
          </div>
        )}
      </div>

      {/* If featured items exist */}
      {portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-amber-400/40 transition-all group"
            >
              <div className="h-44 bg-gradient-to-tr from-black via-white/5 to-white/10 relative overflow-hidden flex items-center justify-center">
                {item.media && item.media[0] ? (
                  <img
                    src={item.media[0].thumbnailUrl || item.media[0].url}
                    alt={item.title || 'Portfolio item'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Sparkles className="w-8 h-8 text-amber-400/60" />
                    <span className="text-xs font-mono">{item.postType}</span>
                  </div>
                )}
                <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                  Featured
                </span>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title || 'Creative Showcase'}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state showcase foundation */
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center relative overflow-hidden">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto text-amber-300">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Showcase Studio Foundation</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                The database schema and portfolio foundation are primed. Phase 3 will introduce high-fidelity
                multimedia uploads supporting lossless audio stems, 4K showreels, and interactive project galleries.
              </p>
            </div>

            {/* Media Formats Foundation Pill Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" /> Audio Waveforms
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" /> Video Reels
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Stills & Concept Art
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
