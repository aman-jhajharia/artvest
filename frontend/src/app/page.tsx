'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApiClient } from '@/services/api';
import {
  Sparkles,
  ArrowRight,
  Search,
  Music,
  Film,
  Camera,
  Palette,
  Sliders,
  CheckCircle2,
  Layers,
  Users,
  Compass,
  Activity,
  Terminal,
} from 'lucide-react';

export default function LandingPage() {
  const [healthStatus, setHealthStatus] = useState<{
    loaded: boolean;
    healthy: boolean;
    version?: string;
    dbStatus?: string;
  }>({ loaded: false, healthy: false });

  useEffect(() => {
    async function checkBackend() {
      const res = await ApiClient.checkHealth();
      if (res.success && res.data) {
        setHealthStatus({
          loaded: true,
          healthy: res.data.status === 'healthy' || res.data.status === 'degraded',
          version: res.data.version,
          dbStatus: res.data.services.database,
        });
      } else {
        setHealthStatus({
          loaded: true,
          healthy: false,
        });
      }
    }
    checkBackend();
  }, []);

  const sampleSearchQueries = [
    { query: 'Classical Singer in Jaipur', role: 'Vocalist', category: 'Music', location: 'Jaipur' },
    { query: 'Cinematographer + Documentary', role: 'Cinematographer', category: 'Film', location: 'Delhi / Remote' },
    { query: 'Female Actor + Hindi + Available', role: 'Actor', category: 'Film & Acting', location: 'Mumbai' },
    { query: '3D Artist + Unreal Engine + VFX', role: '3D Artist', category: 'Digital Arts', location: 'Bangalore' },
  ];

  const creativePillars = [
    {
      title: 'Music & Audio',
      icon: Music,
      color: 'text-pink-400',
      badgeClass: 'glow-badge-music',
      roles: ['Singers', 'Composers', 'Beat Producers', 'Lyricists', 'Audio Engineers'],
      meta: 'Waveforms, vocal ranges, genres & collaborative stems',
    },
    {
      title: 'Film & Screen',
      icon: Film,
      color: 'text-amber-400',
      badgeClass: 'glow-badge-film',
      roles: ['Directors', 'Cinematographers', 'Actors', 'Screenwriters', 'Editors'],
      meta: 'Showreels, scene breakdowns & production credits',
    },
    {
      title: 'Dance & Motion',
      icon: Sparkles,
      color: 'text-purple-400',
      badgeClass: 'glow-badge-dance',
      roles: ['Choreographers', 'Dancers', 'Instructors', 'Dance Crews'],
      meta: 'Movement routines, choreography portfolios & styles',
    },
    {
      title: 'Photography & Vision',
      icon: Camera,
      color: 'text-cyan-400',
      badgeClass: 'glow-badge-photography',
      roles: ['Photographers', 'Videographers', 'Photo Editors'],
      meta: 'Editorial galleries, camera gear specs & EXIF metadata',
    },
    {
      title: 'Design & Digital Arts',
      icon: Palette,
      color: 'text-emerald-400',
      badgeClass: 'glow-badge-design',
      roles: ['3D Artists', 'Concept Illustrators', 'Animators', 'VFX Artists'],
      meta: 'Interactive renders, wireframes & creative portfolios',
    },
    {
      title: 'Production & Crew',
      icon: Sliders,
      color: 'text-orange-400',
      badgeClass: 'glow-badge-production',
      roles: ['Sound Engineers', 'Lighting Techs', 'Costume Designers', 'Assistants'],
      meta: 'Technical proficiencies, set experience & gear lists',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A10] text-gray-100 selection:bg-amber-500 selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-500/15 via-indigo-600/15 to-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${healthStatus.healthy ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${healthStatus.healthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-medium">
              Academic Major Project PR1107 • Phase 0 Architecture Initialized
            </span>
            {healthStatus.loaded && (
              <span className="text-[11px] text-gray-400 border-l border-white/10 pl-2">
                API: {healthStatus.healthy ? 'Online' : 'Offline'}
              </span>
            )}
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Discover Talent.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-indigo-400">
              Build Teams.
            </span>{' '}
            Back Ideas.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto font-normal leading-relaxed">
            A structured creative talent ecosystem where artists, performers, and technical crew
            showcase their genuine capabilities, discover verified collaborators, and build an
            engaged community without dependence on traditional gatekeepers.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app/explore"
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:scale-[1.02] shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Explore Creative Talent
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl text-sm font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              Join as Creator or Supporter
            </Link>
          </div>

          {/* Core differentiator interactive query demo */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-6 text-left shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Structured Creative Discovery vs. Generic Social Feeds
                    </h3>
                    <p className="text-xs text-gray-400">
                      ArtVest indexes multi-dimensional creative attributes: roles, genres, tools, and availability
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-amber-400/90 hidden sm:inline">
                  Service-Layer Filtered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleSearchQueries.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/app/explore?q=${encodeURIComponent(item.query)}`}
                    className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-400/30 transition-all flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-200 group-hover:text-amber-300 transition-colors">
                        &quot;{item.query}&quot;
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        {item.category} • {item.role} • {item.location}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-amber-400 mb-2">
              Cross-Disciplinary Categories
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Built for Every Creative Craft
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              Each discipline maintains structured metadata attributes tailored to its unique
              professional requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creativePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${pillar.color}`} />
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${pillar.badgeClass}`}>
                        {pillar.title}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2">{pillar.title}</h4>
                    <p className="text-xs text-gray-400 mb-4">{pillar.meta}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {pillar.roles.map((role, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>Role-specific metadata</span>
                    <span className="text-amber-400 font-medium">Ready in Schema</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Academic Roadmap & Phased Architecture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#0b0d16]/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-indigo-400 mb-2">
              System Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Two-Phase Academic Development Roadmap
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              Clean separation between Midterm Talent Discovery and End-Term Community Backing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phase 1 Box */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.07] to-transparent p-7 relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-4">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                PHASE 1 • MIDTERM TARGET
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Talent Discovery & Creative Community Platform
              </h4>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Core user journey: Authentication, structured creator profiles, portfolio uploads,
                multimedia feed, social graph (follow, like, comment, save), and multi-criteria discovery.
              </p>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Google OAuth & Role-Based Onboarding
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Role-Specific Creator Metadata & Portfolios
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Multimedia Posts (Image, Video, Audio, Text)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Structured Search (Category + Skill + Location)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Creator Studio & Engagement Aggregation
                </div>
              </div>
            </div>

            {/* Phase 2 Box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 relative opacity-90">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-semibold mb-4">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                PHASE 2 • END TERM EXTENSION
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Community-Backed Creative Projects
              </h4>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Extends platform with structured project teams, virtual credit wallets (educational simulation
                - no real money/crypto), and community project funding milestones.
              </p>

              <div className="space-y-2.5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Project Workspaces & Role Requirements
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Virtual Credit Wallet & Transaction Ledger
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Community Backing & Funding Progress Tracking
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Collaboration Requests & Team Formation
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Project Analytics & Recommendation Engine
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Diagnostics Panel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">System Foundation Status</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Foundation Check</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="text-gray-400 mb-1">Frontend</div>
              <div className="text-emerald-400 font-bold">Next.js 16 + React 19 + Tailwind CSS</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="text-gray-400 mb-1">Backend REST API</div>
              <div className={healthStatus.healthy ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {healthStatus.healthy ? 'Express 4.21 + TypeScript' : 'Ready (Port 5000)'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <div className="text-gray-400 mb-1">Database ORM</div>
              <div className="text-indigo-400 font-bold">Prisma 6 + PostgreSQL Schemas</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
