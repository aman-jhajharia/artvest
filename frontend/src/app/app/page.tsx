'use client';

import React from 'react';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Music,
  Camera,
  Film,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function FeedPage() {
  const samplePosts = [
    {
      id: 'post-1',
      creator: {
        name: 'Aanya Sharma',
        role: 'Classical & Fusion Vocalist',
        location: 'Jaipur, Rajasthan',
        category: 'Music',
        badgeClass: 'glow-badge-music',
      },
      postType: 'AUDIO',
      title: 'Raag Yaman Acoustic Vocal Exploration with Ambient Pads',
      caption: 'Exploring modern ambient textures over traditional Raag Yaman phrasing. Seeking a music producer or sound engineer for collaborative stem mixing.',
      tags: ['Classical', 'Fusion', 'RaagYaman', 'Vocalist'],
      likes: 84,
      comments: 19,
      saves: 32,
      duration: '3:42',
    },
    {
      id: 'post-2',
      creator: {
        name: 'Kabir Verma',
        role: 'Cinematographer & Colorist',
        location: 'Mumbai, Maharashtra',
        category: 'Film & Acting',
        badgeClass: 'glow-badge-film',
      },
      postType: 'VIDEO',
      title: 'Monsoon in Old Jaipur — 16mm Film Emulation Showreel',
      caption: 'Test footage captured during early monsoon twilight using custom film print LUTs and anamorphic glass. Open for indie documentary collaborations.',
      tags: ['Cinematography', '16mm', 'Documentary', 'ColorGrading'],
      likes: 142,
      comments: 28,
      saves: 56,
      duration: '1:15',
    },
    {
      id: 'post-3',
      creator: {
        name: 'Rohan Sen',
        role: 'Editorial & Architectural Photographer',
        location: 'Jaipur, Rajasthan',
        category: 'Photography & Video',
        badgeClass: 'glow-badge-photography',
      },
      postType: 'IMAGE',
      title: 'Hawa Mahal Shadows & Geometry Series (3/6)',
      caption: 'A study of geometric morning shadows against terracotta facades. Shot on Hasselblad medium format.',
      tags: ['Architecture', 'MediumFormat', 'Editorial', 'JaipurHeritage'],
      likes: 215,
      comments: 34,
      saves: 88,
    },
  ];

  return (
    <div>
      {/* Roadmap notification */}
      <PhaseBanner
        phase="Phase 1 Foundation"
        featureName="Feed & Social Interactions"
        description="This shell demonstrates the multimedia feed layout designed for creative showcases (Audio, Video, Photography). Real backend feed fetching and Prisma relational interactions (Like, Comment, Save, Follow) will be connected in Phase 4."
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Creative Feed</h1>
          <p className="text-xs text-gray-400">
            Work showcases and artistic highlights from verified creators
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30">
            Latest Showcases
          </span>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-6 max-w-3xl">
        {samplePosts.map((post) => (
          <article
            key={post.id}
            className="glass-card rounded-2xl p-6 border border-white/10"
          >
            {/* Creator Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center font-bold text-black text-sm">
                  {post.creator.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white hover:text-amber-300 cursor-pointer">
                      {post.creator.name}
                    </h2>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${post.creator.badgeClass}`}>
                      {post.creator.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>{post.creator.role}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      {post.creator.location}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition-colors"
              >
                Follow
              </button>
            </div>

            {/* Post Content & Media Showcase Shell */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white mb-2">{post.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">{post.caption}</p>

              {/* Multimedia Placeholder Card */}
              <div className="h-48 rounded-xl bg-gradient-to-br from-[#121626] to-[#0b0e18] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />

                {post.postType === 'AUDIO' && (
                  <div className="flex flex-col items-center gap-3 text-pink-400">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/40 group-hover:scale-110 transition-transform">
                      <Music className="w-6 h-6 text-pink-400" />
                    </div>
                    <span className="text-xs font-mono text-gray-300">
                      Waveform Audio Track • {post.duration}
                    </span>
                  </div>
                )}

                {post.postType === 'VIDEO' && (
                  <div className="flex flex-col items-center gap-3 text-amber-400">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40 group-hover:scale-110 transition-transform">
                      <Film className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono text-gray-300">
                      Showreel Video Clip • {post.duration}
                    </span>
                  </div>
                )}

                {post.postType === 'IMAGE' && (
                  <div className="flex flex-col items-center gap-3 text-cyan-400">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-xs font-mono text-gray-300">
                      High-Resolution Editorial Gallery
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Post Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Post Social Interactions Toolbar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-gray-400">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-pink-400 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{post.saves}</span>
                </button>
              </div>

              <button
                type="button"
                className="hover:text-white transition-colors"
                title="Share showcase"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
