'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CreatorApiService } from '@/features/creator/services/creator.service';
import { FullCreatorProfile } from '@/features/creator/types/creator.types';
import { RoleAttributesDisplay } from '@/features/creator/components/RoleAttributesDisplay';
import { PortfolioSection } from '@/features/creator/components/PortfolioSection';
import {
  MapPin,
  CheckCircle2,
  Globe,
  Sparkles,
  Award,
  Layers,
  Clock,
  Lock,
  Loader2,
  UserCheck,
  ArrowLeft,
  Share2,
  MessageSquare,
} from 'lucide-react';

function PublicCreatorProfileContent() {
  const params = useParams();
  const creatorId = params?.creatorId as string;

  const [creatorProfile, setCreatorProfile] = useState<FullCreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SHOWCASE' | 'SKILLS' | 'ATTRIBUTES' | 'ABOUT'>('SHOWCASE');

  useEffect(() => {
    if (creatorId) {
      loadPublicProfile(creatorId);
    }
  }, [creatorId]);

  const loadPublicProfile = async (id: string) => {
    setIsLoading(true);
    setIsPrivate(false);
    setErrorMessage(null);

    try {
      const res = await CreatorApiService.getPublicCreatorProfile(id);
      if (res.success && res.data) {
        setCreatorProfile(res.data);
      } else if (res.error?.code === 'PROFILE_PRIVATE') {
        setIsPrivate(true);
      } else {
        setErrorMessage(res.message || 'Creator profile not found');
      }
    } catch {
      setErrorMessage('Could not connect to service');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-xs font-mono text-gray-400">Loading creator profile...</p>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Private Creator Profile</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This creator has set their profile to private. Only authorized collaborators or the profile owner can view their creative details.
          </p>
          <Link
            href="/app/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors mt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!creatorProfile || errorMessage) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Creator Not Found</h2>
          <p className="text-xs text-gray-400">{errorMessage || 'The requested creator profile does not exist.'}</p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const primarySkill = creatorProfile.creatorSkills.find((s) => s.isPrimary);

  return (
    <div className="min-h-screen bg-[#07090e] text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#07090e]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-sm">
              AV
            </div>
            <span className="font-bold text-base tracking-tight text-white">ArtVest</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app/explore"
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Explore Talent
            </Link>
            <Link
              href="/app/profile"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              My Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Profile Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Cover Banner */}
        <div className="h-64 sm:h-72 w-full rounded-3xl bg-gradient-to-r from-amber-950/60 via-purple-950/70 to-indigo-950/60 border border-white/10 relative overflow-hidden flex items-end p-6">
          {creatorProfile.coverImageUrl && (
            <img
              src={creatorProfile.coverImageUrl}
              alt="Cover banner"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/20 pointer-events-none" />

          <div className="flex items-center gap-2 absolute top-4 right-4 z-10">
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-black/60 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Creator Identity
            </span>
          </div>
        </div>

        {/* Header Details */}
        <div className="relative px-2 sm:px-6 -mt-20 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-600 p-1 shadow-2xl shrink-0">
                <div className="w-full h-full rounded-2xl bg-[#121626] flex items-center justify-center text-4xl font-black text-amber-300 overflow-hidden">
                  {creatorProfile.user.avatarUrl ? (
                    <img
                      src={creatorProfile.user.avatarUrl}
                      alt={creatorProfile.stageName || creatorProfile.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (creatorProfile.stageName || creatorProfile.user.name).charAt(0)
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {creatorProfile.stageName || creatorProfile.user.name}
                  </h1>
                  {creatorProfile.isVerified && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                </div>

                {creatorProfile.headline && (
                  <p className="text-sm font-medium text-amber-300/90">{creatorProfile.headline}</p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-gray-400">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium">
                    {creatorProfile.primaryCategory?.name}
                  </span>
                  {primarySkill && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                      ★ {primarySkill.skill.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {creatorProfile.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Collab Capability Callout */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs font-mono px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {creatorProfile.availability.replace(/_/g, ' ')}
              </span>

              <button
                disabled
                title="Direct team building & collaboration inquiries unlock in Phase 4"
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Collaborate (Phase 4)</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-2 mb-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('SHOWCASE')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'SHOWCASE'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Portfolio & Showcases
            </button>
            <button
              onClick={() => setActiveTab('SKILLS')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'SKILLS'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Craft Skills ({creatorProfile.creatorSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('ATTRIBUTES')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'ATTRIBUTES'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Discipline Attributes
            </button>
            <button
              onClick={() => setActiveTab('ABOUT')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'ABOUT'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> About & Logistics
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'SHOWCASE' && (
            <PortfolioSection portfolio={creatorProfile.portfolio} isOwner={false} />
          )}

          {activeTab === 'SKILLS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {creatorProfile.creatorSkills.map((cs) => (
                <div
                  key={cs.id}
                  className={`p-4 rounded-2xl border ${
                    cs.isPrimary
                      ? 'bg-amber-500/[0.04] border-amber-500/30'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-white text-sm">{cs.skill.name}</span>
                    {cs.isPrimary && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="text-[11px] font-mono text-purple-300 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {cs.proficiency || 'INTERMEDIATE'}
                    </span>
                    {cs.yearsExperience !== null && cs.yearsExperience !== undefined && (
                      <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cs.yearsExperience} yrs exp
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ATTRIBUTES' && (
            <RoleAttributesDisplay
              categorySlug={creatorProfile.primaryCategory?.slug}
              roleAttributes={creatorProfile.roleAttributes}
            />
          )}

          {activeTab === 'ABOUT' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                    Creative Statement
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                    {creatorProfile.bio || 'No bio provided yet.'}
                  </p>
                </div>

                {creatorProfile.website && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>{creatorProfile.website}</span>
                    </div>
                    <a
                      href={creatorProfile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-300 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-xs">
                  <span className="font-mono uppercase tracking-wider text-gray-400 block">Logistics</span>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-medium">{creatorProfile.experienceLevel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Years Active</span>
                    <span className="text-white font-medium">{creatorProfile.yearsExperience || 0} years</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Availability</span>
                    <span className="text-emerald-400 font-medium">
                      {creatorProfile.availability.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PublicCreatorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-xs font-mono text-gray-400">Loading creator profile...</p>
        </div>
      }
    >
      <PublicCreatorProfileContent />
    </Suspense>
  );
}
