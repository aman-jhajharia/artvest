'use client';

import React, { useState } from 'react';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Briefcase,
  Share2,
  Globe,
  Sparkles,
  Music,
  Heart,
  MessageSquare,
  Bookmark,
  Edit3,
} from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'SHOWCASE' | 'ATTRIBUTES' | 'COLLABORATION'>('SHOWCASE');

  const creator = {
    name: 'Aanya Sharma',
    stageName: 'Aanya Swara',
    username: 'aanya_swara',
    category: 'Music',
    primaryRole: 'Classical Singer & Vocalist',
    location: 'Jaipur, Rajasthan',
    country: 'India',
    experienceLevel: 'PROFESSIONAL',
    yearsExperience: 7,
    availability: 'AVAILABLE_FOR_COLLAB',
    bio: 'Jaipur-based vocalist and composer bridging 400-year-old Hindustani classical ragas with contemporary ambient soundscapes. Passionate about cross-disciplinary collaboration with cinematographers, sound designers, and indie filmmakers.',
    followersCount: 1420,
    followingCount: 310,
    postsCount: 18,
    isVerified: true,
    website: 'https://aanyaswara.art',
    socialLinks: {
      spotify: 'https://spotify.com/artist/aanyaswara',
      youtube: 'https://youtube.com/@aanyaswara',
      instagram: 'https://instagram.com/aanyaswara',
    },
    // Role-specific structured metadata
    roleAttributes: {
      genres: ['Hindustani Classical', 'Khayal', 'Semi-Classical Ghazal', 'Ambient Fusion'],
      languages: ['Hindi', 'Sanskrit', 'Marwari', 'Braj Bhasha', 'English'],
      vocalType: 'Mezzo-Soprano (3-octave flexibility)',
      gharanaTraining: 'Jaipur-Atrauli Gharana (7 years formal Guru-Shishya parampara)',
      instruments: ['Harmonium', 'Tanpura', 'Basic MIDI Keyboard'],
    },
    collaborationPreferences: {
      lookingFor: ['Indie Film Directors', 'Cinematographers for Music Videos', 'Sound Engineers for Stem Mixing', 'Contemporary Dancers'],
      openForRemote: true,
      openForStageProductions: true,
    },
  };

  return (
    <div>
      <PhaseBanner
        phase="Phase 1 Foundation"
        featureName="Role-Specific Creator Profile"
        description="This shell demonstrates common creator profile metadata combined with scalable role-specific attributes (genres, vocal range, languages, equipment) without rigid database schema bloat."
      />

      {/* Cover Banner */}
      <div className="h-56 w-full rounded-2xl bg-gradient-to-r from-amber-900/40 via-indigo-950/60 to-purple-900/40 border border-white/10 relative overflow-hidden flex items-end p-6">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-2 absolute top-4 right-4">
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-black/60 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Creator Profile
          </span>
        </div>
      </div>

      {/* Profile Header Details */}
      <div className="relative px-2 sm:px-6 -mt-16 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="flex items-end gap-4">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-600 p-1 shadow-2xl">
              <div className="w-full h-full rounded-xl bg-[#121626] flex items-center justify-center text-3xl font-black text-amber-300">
                AS
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{creator.name}</h1>
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span className="text-amber-300 font-semibold">{creator.stageName}</span>
                <span>•</span>
                <span>@{creator.username}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <button
              type="button"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio & Meta */}
        <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed mb-4">
          {creator.bio}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-6">
          <span className="flex items-center gap-1 text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            {creator.location}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            Available for Collaboration
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {creator.yearsExperience} Years Experience ({creator.experienceLevel})
          </span>
          <span>•</span>
          <a
            href={creator.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-amber-300 hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            Portfolio Link
          </a>
        </div>

        {/* Counts summary */}
        <div className="flex items-center gap-6 py-3 border-y border-white/10 text-xs">
          <div>
            <span className="font-bold text-white mr-1.5">{creator.followersCount}</span>
            <span className="text-gray-400">Followers</span>
          </div>
          <div>
            <span className="font-bold text-white mr-1.5">{creator.followingCount}</span>
            <span className="text-gray-400">Following</span>
          </div>
          <div>
            <span className="font-bold text-white mr-1.5">{creator.postsCount}</span>
            <span className="text-gray-400">Showcases</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('SHOWCASE')}
          className={`py-3 px-5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'SHOWCASE'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Work Showcase & Feed (18)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ATTRIBUTES')}
          className={`py-3 px-5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'ATTRIBUTES'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Role-Specific Craft Metadata
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('COLLABORATION')}
          className={`py-3 px-5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'COLLABORATION'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Collaboration Interests
        </button>
      </div>

      {/* Tab Content: Role-Specific Metadata */}
      {activeTab === 'ATTRIBUTES' && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 max-w-3xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Vocalist Craft Attributes</h3>
              <p className="text-xs text-gray-400">Structured domain specifications indexed for discovery</p>
            </div>
            <span className="text-xs font-mono text-amber-400 glow-badge-music px-2.5 py-0.5 rounded-full">
              Category: Music
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-400 block mb-2">Specialized Musical Genres:</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.roleAttributes.genres.map((g, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/30">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-400 block mb-2">Vocal Performance Languages:</span>
            <div className="flex flex-wrap gap-1.5">
              {creator.roleAttributes.languages.map((l, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-200 border border-white/10">
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[11px] text-gray-400 block">Vocal Classification:</span>
              <span className="text-xs font-bold text-amber-300">{creator.roleAttributes.vocalType}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[11px] text-gray-400 block">Lineage / Gharana Training:</span>
              <span className="text-xs font-bold text-white">{creator.roleAttributes.gharanaTraining}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Collaboration Interests */}
      {activeTab === 'COLLABORATION' && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 max-w-3xl space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Seeking Collaborators In:</h3>
          <div className="flex flex-wrap gap-2">
            {creator.collaborationPreferences.lookingFor.map((item, idx) => (
              <span key={idx} className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" />
                {item}
              </span>
            ))}
          </div>
          <div className="pt-4 border-t border-white/10 text-xs text-gray-400 flex items-center gap-4">
            <span className="text-emerald-400 font-medium">✓ Open to Remote Collaboration</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">✓ Open to Stage Productions</span>
          </div>
        </div>
      )}

      {/* Tab Content: Work Showcase Cards */}
      {activeTab === 'SHOWCASE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                Audio Showcase
              </span>
              <span className="text-[11px] text-gray-400 font-mono">3:42</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Raag Yaman Acoustic Vocal Exploration with Ambient Pads
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Experimental acoustic recording showcasing microtonal komal re expressions.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400">
              <span className="flex items-center gap-1 text-pink-400">
                <Heart className="w-3.5 h-3.5" /> 84
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <MessageSquare className="w-3.5 h-3.5" /> 19
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Bookmark className="w-3.5 h-3.5" /> 32
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Performance Excerpt
              </span>
              <span className="text-[11px] text-gray-400 font-mono">5:18</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Thumri & Classical Tarana Live at Jaipur Literature Festival
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Accompanied by tabla and sarangi accompaniment.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400">
              <span className="flex items-center gap-1 text-pink-400">
                <Heart className="w-3.5 h-3.5" /> 132
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <MessageSquare className="w-3.5 h-3.5" /> 41
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Bookmark className="w-3.5 h-3.5" /> 67
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
