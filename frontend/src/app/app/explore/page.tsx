'use client';

import React, { useState } from 'react';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import {
  Search,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Layers,
} from 'lucide-react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');

  const categories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'music', name: 'Music' },
    { id: 'film-acting', name: 'Film & Acting' },
    { id: 'dance', name: 'Dance' },
    { id: 'photography-video', name: 'Photography & Video' },
    { id: 'design-digital-arts', name: 'Design & Digital Arts' },
    { id: 'production-support', name: 'Production & Support' },
  ];

  const sampleCreators = [
    {
      id: 'c-1',
      name: 'Aanya Sharma',
      stageName: 'Aanya Swara',
      primaryRole: 'Classical Singer & Vocalist',
      category: 'Music',
      categorySlug: 'music',
      location: 'Jaipur, Rajasthan',
      city: 'Jaipur',
      experience: 'PROFESSIONAL',
      years: 7,
      availability: 'AVAILABLE_FOR_COLLAB',
      badgeClass: 'glow-badge-music',
      headline: 'Hindustani Classical & Ambient Fusion Vocalist',
      skills: ['Vocalist', 'Classical Singer', 'Harmonium', 'Composer'],
      roleAttributes: {
        'Genres': 'Classical, Semi-Classical, Ghazal, Ambient Fusion',
        'Languages': 'Hindi, Sanskrit, Marwari',
        'Vocal Range': 'Mezzo-Soprano / 3 Octaves',
      },
      collaborationStatus: 'Seeking music producers for indie album stems',
    },
    {
      id: 'c-2',
      name: 'Kabir Verma',
      stageName: 'Kabir V.',
      primaryRole: 'Cinematographer & Director',
      category: 'Film & Acting',
      categorySlug: 'film-acting',
      location: 'Jaipur, Rajasthan',
      city: 'Jaipur',
      experience: 'ADVANCED',
      years: 5,
      availability: 'AVAILABLE_FOR_COLLAB',
      badgeClass: 'glow-badge-film',
      headline: 'Documentary & Narrative Cinematographer',
      skills: ['Cinematographer', 'Colorist', 'Film Editor', 'Director'],
      roleAttributes: {
        'Specialization': 'Documentary, 16mm Emulation, Heritage',
        'Camera Systems': 'ARRI Alexa Mini, Sony FX6, Blackmagic',
        'Software': 'DaVinci Resolve Studio, Premiere Pro',
      },
      collaborationStatus: 'Looking for Screenwriter & Sound Designer',
    },
    {
      id: 'c-3',
      name: 'Meera Deshmukh',
      stageName: 'Meera D.',
      primaryRole: 'Contemporary Dancer & Choreographer',
      category: 'Dance',
      categorySlug: 'dance',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      experience: 'PROFESSIONAL',
      years: 8,
      availability: 'OPEN_TO_WORK',
      badgeClass: 'glow-badge-dance',
      headline: 'Kathak & Contemporary Fusion Choreographer',
      skills: ['Choreographer', 'Dancer', 'Dance Instructor'],
      roleAttributes: {
        'Dance Forms': 'Kathak (Lucknow Gharana), Contemporary, Movement Theater',
        'Performance Experience': '12+ National Festivals, 3 Stage Productions',
      },
      collaborationStatus: 'Available for stage productions & music videos',
    },
    {
      id: 'c-4',
      name: 'Rohan Sen',
      stageName: 'Rohan Sen',
      primaryRole: 'Editorial & Heritage Photographer',
      category: 'Photography & Video',
      categorySlug: 'photography-video',
      location: 'Jaipur, Rajasthan',
      city: 'Jaipur',
      experience: 'INTERMEDIATE',
      years: 4,
      availability: 'FREELANCE',
      badgeClass: 'glow-badge-photography',
      headline: 'Specializing in Architecture, Shadows & Heritage Spaces',
      skills: ['Photographer', 'Photo Editor', 'Videographer'],
      roleAttributes: {
        'Photography Styles': 'Editorial, Architecture, Monochrome, Street',
        'Equipment': 'Hasselblad X2D, Leica M11, Prime Lenses',
      },
      collaborationStatus: 'Open for editorial shoots & art publications',
    },
    {
      id: 'c-5',
      name: 'Devika Nair',
      stageName: 'Devika VFX',
      primaryRole: '3D Environment & VFX Artist',
      category: 'Design & Digital Arts',
      categorySlug: 'design-digital-arts',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      experience: 'PROFESSIONAL',
      years: 6,
      availability: 'AVAILABLE_FOR_COLLAB',
      badgeClass: 'glow-badge-design',
      headline: 'Photorealistic Virtual Sets & Unreal Engine Worlds',
      skills: ['3D Artist', 'VFX Artist', 'Animator', 'Illustrator'],
      roleAttributes: {
        'Engines': 'Unreal Engine 5, Blender, Houdini, Substance Painter',
        'Focus': 'Real-time Virtual Production, World Building',
      },
      collaborationStatus: 'Seeking indie film directors for virtual production',
    },
    {
      id: 'c-6',
      name: 'Vikram Joshi',
      stageName: 'Vikram J.',
      primaryRole: 'Location Sound Recordist & Audio Mixer',
      category: 'Production & Support',
      categorySlug: 'production-support',
      location: 'Delhi, NCR',
      city: 'Delhi',
      experience: 'ADVANCED',
      years: 5,
      availability: 'OPEN_TO_WORK',
      badgeClass: 'glow-badge-production',
      headline: 'Foley, Dialogue Recording & Spatial Audio',
      skills: ['Sound Engineer', 'Lighting Technician', 'Production Assistant'],
      roleAttributes: {
        'Gear': 'Sound Devices 833, Sennheiser MKH 416, Wisycom Wireless',
        'Field Experience': '14 Short Films, 2 Feature Productions',
      },
      collaborationStatus: 'Available for short film and indie features',
    },
  ];

  // Client-side visual filter for initial shell demo
  const filteredCreators = sampleCreators.filter((creator) => {
    const matchesCategory = selectedCategory === 'ALL' || creator.categorySlug === selectedCategory;
    const matchesCity = selectedCity === 'ALL' || creator.city.toLowerCase() === selectedCity.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === '' ||
      creator.name.toLowerCase().includes(query) ||
      creator.primaryRole.toLowerCase().includes(query) ||
      creator.headline.toLowerCase().includes(query) ||
      creator.skills.some((s) => s.toLowerCase().includes(query)) ||
      creator.location.toLowerCase().includes(query);

    return matchesCategory && matchesCity && matchesQuery;
  });

  return (
    <div>
      <PhaseBanner
        phase="Phase 1 Foundation"
        featureName="Structured Talent Discovery"
        description="This shell demonstrates structured multi-criteria talent indexing (Categories, Roles, Locations, Role-Specific Metadata attributes). In Phase 5, this will query the backend /api/creators search service backed by Prisma PostgreSQL indexes."
      />

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Structured Talent Discovery</h1>
        <p className="text-xs text-gray-400 mt-1">
          Search creative professionals by role, discipline, location, and structured craft capabilities
        </p>
      </div>

      {/* Structured Search Toolbar */}
      <div className="glass-panel rounded-2xl p-4 mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try searching: "Classical Singer in Jaipur" or "Cinematographer + Documentary" or "VFX"'
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Filter Discipline:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 flex-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-500/20'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white/5 text-gray-300 border border-white/10 rounded-lg text-xs py-1 px-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Cities</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Results Summary */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>Showing {filteredCreators.length} structured creator profiles</span>
        <span className="text-[11px] font-mono text-amber-400">Multi-attribute Filter Active</span>
      </div>

      {/* Creator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCreators.map((creator) => (
          <div
            key={creator.id}
            className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
          >
            <div>
              {/* Top Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-500 flex items-center justify-center font-bold text-black text-base shadow-md">
                    {creator.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{creator.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${creator.badgeClass}`}>
                        {creator.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="text-amber-300 font-medium">{creator.primaryRole}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {creator.location}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {creator.experience}
                </span>
              </div>

              {/* Headline */}
              <p className="text-xs text-gray-300 mb-4">{creator.headline}</p>

              {/* Structured Craft Attributes Block (Differentiator) */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-amber-400 tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Structured Craft Attributes</span>
                </div>
                {Object.entries(creator.roleAttributes).map(([key, val]) => (
                  <div key={key} className="text-[11px] flex items-start gap-2">
                    <span className="text-gray-400 shrink-0 font-medium">{key}:</span>
                    <span className="text-gray-200">{val}</span>
                  </div>
                ))}
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {creator.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Collaboration Request Status */}
              <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-lg">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{creator.collaborationStatus}</span>
              </div>
            </div>

            {/* Card Action Buttons */}
            <div className="pt-5 border-t border-white/5 mt-5 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                {creator.years}+ years professional craft
              </span>

              <a
                href="/app/profile"
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
              >
                View Full Profile
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
