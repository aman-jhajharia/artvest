'use client';

import React from 'react';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import {
  Users,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Award,
  Upload,
  UserCheck,
} from 'lucide-react';

export default function StudioPage() {
  const stats = [
    { label: 'Followers', value: '1,420', change: '+12% this month', icon: Users, color: 'text-amber-400' },
    { label: 'Showcase Views', value: '28,940', change: '+24% this month', icon: Eye, color: 'text-cyan-400' },
    { label: 'Appreciation Likes', value: '3,810', change: '+8% this month', icon: Heart, color: 'text-pink-400' },
    { label: 'Community Comments', value: '492', change: '+15% this month', icon: MessageSquare, color: 'text-indigo-400' },
  ];

  return (
    <div>
      <PhaseBanner
        phase="Phase 1 Foundation"
        featureName="Creator Studio & Analytics"
        description="This shell demonstrates creator portfolio health, engagement aggregation, and collaboration status management. Real backend analytics aggregations will be plugged in Phase 6."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Creator Studio</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your professional showcase, verify portfolio attributes, and track community engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload New Showcase
          </button>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="glass-panel rounded-2xl p-6 mb-8 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Creator Profile Strength: 85%</h3>
              <p className="text-xs text-gray-400">
                Add your equipment list & collaboration preferences to reach 100%
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
            Professional Rank
          </span>
        </div>

        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
          <div className="bg-gradient-to-r from-amber-400 to-pink-500 h-full rounded-full w-[85%]" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collaboration Inquiries Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Collaboration Requests</h3>
            </div>
            <span className="text-xs text-amber-400 font-medium">Phase 1 Extension</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Kabir Verma (Cinematographer)</p>
                <p className="text-[11px] text-gray-400">
                  Interested in collaborating on acoustic vocal recording for documentary
                </p>
              </div>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Pending
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Devika Nair (3D Environment)</p>
                <p className="text-[11px] text-gray-400">
                  Invited you to collaborate on immersive spatial audio experiment
                </p>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Top Performing Showcase */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">Top Showcase Engagement</h3>
            </div>
            <span className="text-xs text-gray-400">Past 30 Days</span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <h4 className="text-xs font-bold text-white mb-1">
              Raag Yaman Acoustic Vocal Exploration with Ambient Pads
            </h4>
            <p className="text-[11px] text-gray-400 mb-3">
              Music • Audio Showcase • 3:42 Duration
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-white/5">
                <div className="text-gray-400 text-[10px]">Plays</div>
                <div className="font-bold text-white">14,200</div>
              </div>
              <div className="p-2 rounded bg-white/5">
                <div className="text-gray-400 text-[10px]">Appreciations</div>
                <div className="font-bold text-pink-400">1,920</div>
              </div>
              <div className="p-2 rounded bg-white/5">
                <div className="text-gray-400 text-[10px]">Saves</div>
                <div className="font-bold text-cyan-400">418</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
