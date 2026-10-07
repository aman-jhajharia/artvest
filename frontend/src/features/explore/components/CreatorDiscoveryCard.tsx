'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  UserCheck,
  UserPlus,
  Briefcase,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CreatorDiscoveryItem } from '../types/explore.types';
import { InteractionApiService } from '@/features/interactions/services/interaction.service';

interface CreatorDiscoveryCardProps {
  creator: CreatorDiscoveryItem;
  onCollaborate: (creator: CreatorDiscoveryItem) => void;
}

export const CreatorDiscoveryCard: React.FC<CreatorDiscoveryCardProps> = ({
  creator,
  onCollaborate,
}) => {
  const [isFollowing, setIsFollowing] = useState(creator.isFollowing);
  const [followerCount, setFollowerCount] = useState(creator.followerCount);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFollowLoading) return;
    setIsFollowLoading(true);

    const prevFollowing = isFollowing;
    const prevCount = followerCount;

    // Optimistic toggle
    setIsFollowing(!prevFollowing);
    setFollowerCount(prevFollowing ? prevCount - 1 : prevCount + 1);

    try {
      const res = prevFollowing
        ? await InteractionApiService.unfollowCreator(creator.id)
        : await InteractionApiService.followCreator(creator.id);

      if (!res.success) {
        // Rollback
        setIsFollowing(prevFollowing);
        setFollowerCount(prevCount);
      }
    } catch {
      setIsFollowing(prevFollowing);
      setFollowerCount(prevCount);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const getCategoryBadgeClass = (themeKey?: string | null) => {
    switch (themeKey) {
      case 'music':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'film':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'dance':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'photography':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'design':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    }
  };

  const formatAvailability = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE_FOR_COLLAB':
        return { label: 'Available to Collab', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'OPEN_TO_WORK':
        return { label: 'Open to Work', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'FREELANCE':
        return { label: 'Freelance Only', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'COMMISSION':
        return { label: 'Commissions Open', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Not Available', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
    }
  };

  const availInfo = formatAvailability(creator.availability);

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300 group shadow-lg">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <Link
            href={`/creator/${creator.id}`}
            className="flex items-center gap-3 min-w-0 flex-1 group-hover:opacity-95"
          >
            {/* Avatar */}
            <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#12131A] overflow-hidden flex items-center justify-center font-bold text-amber-300 text-base">
                {creator.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creator.avatarUrl}
                    alt={creator.stageName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  creator.stageName.charAt(0)
                )}
              </div>
            </div>

            {/* Names & Category */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                  {creator.stageName}
                </h3>
                {creator.isVerified && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                    creator.primaryCategory.themeKey
                  )}`}
                >
                  {creator.primaryCategory.name}
                </span>

                <span className="text-xs text-gray-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                  {creator.city || creator.location}
                </span>
              </div>
            </div>
          </Link>

          {/* Experience Badge */}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 shrink-0">
            {creator.experienceLevel}
          </span>
        </div>

        {/* Headline */}
        {creator.headline && (
          <p className="text-xs text-gray-300 line-clamp-2 mb-3">
            {creator.headline}
          </p>
        )}

        {/* Structured Role Attributes Block (ArtVest Core Differentiator) */}
        {creator.roleAttributes && Object.keys(creator.roleAttributes).length > 0 && (
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 mb-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-semibold text-amber-400 tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Structured Craft Attributes</span>
            </div>
            {Object.entries(creator.roleAttributes)
              .slice(0, 2)
              .map(([key, val]) => (
                <div key={key} className="text-[11px] flex items-start gap-1.5 truncate">
                  <span className="text-gray-400 font-medium shrink-0">{key}:</span>
                  <span className="text-gray-200 truncate">{String(val)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {creator.skills.slice(0, 4).map((sk) => (
            <span
              key={sk.id}
              className={`text-[11px] px-2 py-0.5 rounded border ${
                sk.isPrimary
                  ? 'bg-amber-400/10 text-amber-300 border-amber-400/20 font-medium'
                  : 'bg-white/5 text-gray-300 border-white/5'
              }`}
            >
              {sk.name}
              {sk.proficiency && (
                <span className="text-[9px] text-gray-400 ml-1 opacity-70">
                  ({sk.proficiency.charAt(0)})
                </span>
              )}
            </span>
          ))}
          {creator.skills.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 text-gray-500 self-center">
              +{creator.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Availability & Social Metrics Bar */}
        <div className="flex items-center justify-between gap-2 text-xs py-2 px-2.5 rounded-xl bg-white/[0.03] border border-white/5 mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${availInfo.color}`}>
            {availInfo.label}
          </span>

          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
            <span>{followerCount} Followers</span>
            <span>•</span>
            <span className="text-gray-300">{creator.postCount} Works</span>
          </div>
        </div>

        {/* Deterministic Relevance Score Indicator */}
        {creator.relevanceScore > 0 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
              className="w-full flex items-center justify-between text-[11px] text-amber-400 hover:text-amber-300 transition-colors py-1 px-2 rounded-lg bg-amber-400/5 border border-amber-400/20"
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Relevance: {creator.relevanceScore} pts
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                {showScoreBreakdown ? 'Hide Breakdown' : 'Explain Score'}
                {showScoreBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </button>

            {showScoreBreakdown && creator.scoreBreakdown && (
              <div className="mt-1.5 p-2 rounded-lg bg-black/60 border border-white/10 text-[10px] space-y-1 text-gray-300 animate-in fade-in duration-200">
                <div className="flex justify-between">
                  <span className="text-gray-400">Keyword Match:</span>
                  <span className="font-mono text-amber-300">+{creator.scoreBreakdown.keywordMatch}</span>
                </div>
                {creator.scoreBreakdown.skillMatch > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skill Match:</span>
                    <span className="font-mono text-amber-300">+{creator.scoreBreakdown.skillMatch}</span>
                  </div>
                )}
                {creator.scoreBreakdown.locationMatch > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location Match:</span>
                    <span className="font-mono text-amber-300">+{creator.scoreBreakdown.locationMatch}</span>
                  </div>
                )}
                {creator.scoreBreakdown.categoryMatch > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category Match:</span>
                    <span className="font-mono text-amber-300">+{creator.scoreBreakdown.categoryMatch}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Profile Quality:</span>
                  <span className="font-mono text-amber-300">+{creator.scoreBreakdown.profileQuality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Portfolio Depth:</span>
                  <span className="font-mono text-amber-300">+{creator.scoreBreakdown.portfolioDepth}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Action Controls */}
      <div className="pt-3.5 border-t border-white/5 flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-2">
          {/* Follow Button */}
          <button
            type="button"
            onClick={handleToggleFollow}
            disabled={isFollowLoading}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isFollowing
                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                Follow
              </>
            )}
          </button>

          {/* Collaborate Action */}
          <button
            type="button"
            onClick={() => onCollaborate(creator)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            Collab
          </button>
        </div>

        {/* View Profile */}
        <Link
          href={`/creator/${creator.id}`}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title="View Full Profile"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
