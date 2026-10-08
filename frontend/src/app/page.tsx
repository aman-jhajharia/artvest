'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Sparkles,
  ArrowRight,
  Search,
  Music,
  Film,
  Camera,
  Palette,
  Sliders,
  Layers,
  Users,
  Compass,
  Heart,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const sampleSearchQueries = [
    { query: 'Classical Singer in Jaipur', role: 'Vocalist', category: 'Music', location: 'Jaipur' },
    { query: 'Cinematographer + Documentary', role: 'Cinematographer', category: 'Film', location: 'Delhi / Remote' },
    { query: 'Female Actor + Hindi + Available', role: 'Actor', category: 'Film & Acting', location: 'Mumbai' },
    { query: '3D Artist + Unreal Engine + VFX', role: '3D Artist', category: 'Digital Arts', location: 'Bangalore' },
  ];

  const creativePillars = [
    {
      title: 'Music & Audio',
      slug: 'music',
      icon: Music,
      color: 'text-pink-400',
      badgeClass: 'glow-badge-music',
      roles: ['Singers', 'Composers', 'Beat Producers', 'Lyricists', 'Audio Engineers'],
      meta: 'Waveforms, vocal ranges, genres & collaborative stems',
    },
    {
      title: 'Film & Screen',
      slug: 'film-acting',
      icon: Film,
      color: 'text-amber-400',
      badgeClass: 'glow-badge-film',
      roles: ['Directors', 'Cinematographers', 'Actors', 'Screenwriters', 'Editors'],
      meta: 'Showreels, scene breakdowns & production credits',
    },
    {
      title: 'Dance & Motion',
      slug: 'dance',
      icon: Sparkles,
      color: 'text-purple-400',
      badgeClass: 'glow-badge-dance',
      roles: ['Choreographers', 'Dancers', 'Instructors', 'Dance Crews'],
      meta: 'Movement routines, choreography portfolios & styles',
    },
    {
      title: 'Photography & Vision',
      slug: 'photography-video',
      icon: Camera,
      color: 'text-cyan-400',
      badgeClass: 'glow-badge-photography',
      roles: ['Photographers', 'Videographers', 'Photo Editors'],
      meta: 'Editorial galleries, camera gear specs & EXIF metadata',
    },
    {
      title: 'Design & Digital Arts',
      slug: 'design-digital-arts',
      icon: Palette,
      color: 'text-emerald-400',
      badgeClass: 'glow-badge-design',
      roles: ['3D Artists', 'Concept Illustrators', 'Animators', 'VFX Artists'],
      meta: 'Interactive renders, wireframes & creative portfolios',
    },
    {
      title: 'Production & Crew',
      slug: 'production-support',
      icon: Sliders,
      color: 'text-orange-400',
      badgeClass: 'glow-badge-production',
      roles: ['Sound Engineers', 'Lighting Techs', 'Costume Designers', 'Assistants'],
      meta: 'Technical proficiencies, set experience & gear lists',
    },
  ];

  const showcaseHighlights = [
    {
      title: 'Hindustani Classical Morning Ragas',
      creator: 'Aanya Sharma',
      role: 'Classical Vocalist',
      location: 'New Delhi',
      category: 'Music & Audio',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      stats: { likes: 38, saves: 19 },
      badge: 'Vocal Track',
    },
    {
      title: 'Echoes of Old Delhi — 4K Anamorphic Reel',
      creator: 'Kabir Mehta',
      role: 'Cinematographer',
      location: 'Delhi',
      category: 'Film & Screen',
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
      stats: { likes: 45, saves: 28 },
      badge: 'Showreel',
    },
    {
      title: 'Nebula Reverie: Contemporary Canvas Series',
      creator: 'Maya Lin',
      role: 'Visual Artist',
      location: 'Mumbai',
      category: 'Visual Arts',
      thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      stats: { likes: 52, saves: 34 },
      badge: 'Original Work',
    },
    {
      title: 'Cybernetic Temple Environment in UE5',
      creator: 'Devansh Patel',
      role: '3D VFX Artist',
      location: 'Bangalore',
      category: 'Digital Arts',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      stats: { likes: 61, saves: 42 },
      badge: '3D Render',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A10] text-gray-100 selection:bg-amber-500 selection:text-black">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-500/15 via-indigo-600/15 to-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Consumer Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 mb-8 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">The Creative Talent &amp; Discovery Ecosystem</span>
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
            A creative talent discovery and showcase platform where creators can present their work, discover other talent, and connect for collaboration.
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
                  Structured Search
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

      {/* 2. Creative Categories Section */}
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
              Each discipline maintains structured attributes tailored to its unique creative and professional requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creativePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Link
                  key={idx}
                  href={`/app/explore?category=${pillar.slug}`}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-amber-400/30 transition-all duration-300 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className={`w-5 h-5 ${pillar.color}`} />
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${pillar.badgeClass}`}>
                        {pillar.title}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {pillar.title}
                    </h4>
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

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-amber-300 transition-colors">
                    <span>Explore {pillar.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Product Benefits: Everything You Need to Discover Creative Talent */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#0b0d16]/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-indigo-400 mb-2">
              Platform Features
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Everything You Need to Discover Creative Talent
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              ArtVest brings discovery, creative portfolios, and collaboration into one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit Card A: Showcase Your Work */}
            <div className="glass-card rounded-2xl border border-white/10 p-7 flex flex-col justify-between hover:border-amber-400/30 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mb-6">
                  <Palette className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Showcase Your Work
                </h4>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Build a multimedia portfolio that represents your creative identity.
                </p>
              </div>

              <div className="space-y-3 text-xs text-gray-300 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Images, video reels &amp; audio with waveforms</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Role attributes, tools, and technical proficiencies</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Custom portfolio curation with featured showcases</span>
                </div>
              </div>
            </div>

            {/* Benefit Card B: Discover the Right Talent */}
            <div className="glass-card rounded-2xl border border-white/10 p-7 flex flex-col justify-between hover:border-indigo-400/30 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Discover the Right Talent
                </h4>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Find creators using categories, skills, location, and creative interests.
                </p>
              </div>

              <div className="space-y-3 text-xs text-gray-300 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Multi-criteria search across creative taxonomy</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Filter by location, experience &amp; availability</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Transparent metrics without algorithmic gatekeeping</span>
                </div>
              </div>
            </div>

            {/* Benefit Card C: Connect & Collaborate */}
            <div className="glass-card rounded-2xl border border-white/10 p-7 flex flex-col justify-between hover:border-emerald-400/30 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Connect &amp; Collaborate
                </h4>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Discover people and reach out when you find the right creative fit.
                </p>
              </div>

              <div className="space-y-3 text-xs text-gray-300 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Structured collaboration inquiries with project briefs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Follow creators &amp; bookmark inspiring work</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>In-app notifications for feedback and responses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Showcase Section: Discover What Creators Are Making */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-semibold text-amber-400 mb-2">
                Creative Showcase
              </h2>
              <h3 className="text-3xl font-extrabold text-white">
                Discover What Creators Are Making
              </h3>
              <p className="mt-3 text-sm text-gray-400 max-w-2xl">
                Explore creative work from artists, designers, filmmakers, musicians, dancers, photographers, and production talent.
              </p>
            </div>

            <Link
              href="/app/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <span>Explore All Showcases</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseHighlights.map((item, idx) => (
              <Link
                key={idx}
                href="/app/explore"
                className="glass-card rounded-2xl overflow-hidden border border-white/10 group hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-gray-200 border border-white/10">
                      {item.badge}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {item.creator} • {item.role}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {item.location}
                    </p>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="px-4 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-gray-400">
                  <span className="text-[11px] font-mono text-amber-400/90">{item.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Heart className="w-3 h-3 text-pink-400/80" />
                      {item.stats.likes}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Bookmark className="w-3 h-3 text-amber-400/80" />
                      {item.stats.saves}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-[#0e101a] to-[#090A10] relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 mb-6 shadow-xl shadow-amber-500/10">
            <Sparkles className="w-7 h-7" />
          </div>

          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Your creativity deserves to be discovered.
          </h3>

          <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Join ArtVest and put your work in front of people looking for creative talent.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app/explore"
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:scale-[1.02] shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Explore Talent
            </Link>

            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl text-sm font-semibold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              Join ArtVest
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
