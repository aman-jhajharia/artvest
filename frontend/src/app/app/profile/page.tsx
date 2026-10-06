'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CreatorApiService } from '@/features/creator/services/creator.service';
import { FullCreatorProfile, StandardUserProfile } from '@/features/creator/types/creator.types';
import { ProfileStrengthCard } from '@/features/creator/components/ProfileStrengthCard';
import { RoleAttributesDisplay } from '@/features/creator/components/RoleAttributesDisplay';
import { PortfolioSection } from '@/features/creator/components/PortfolioSection';
import { EditProfileModal } from '@/features/creator/components/EditProfileModal';
import { SkillsManagerModal } from '@/features/creator/components/SkillsManagerModal';
import {
  MapPin,
  CheckCircle2,
  Briefcase,
  Globe,
  Sparkles,
  Edit3,
  ExternalLink,
  Award,
  Layers,
  Clock,
  Eye,
  Lock,
  Loader2,
  UserCheck,
  Compass,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [creatorProfile, setCreatorProfile] = useState<FullCreatorProfile | null>(null);
  const [userProfile, setUserProfile] = useState<StandardUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'SHOWCASE' | 'SKILLS' | 'ATTRIBUTES' | 'ABOUT'>('SHOWCASE');

  const loadProfile = async () => {
    if (!user) return;
    setIsLoadingProfile(true);
    setErrorMessage(null);

    try {
      if (user.role === 'CREATOR') {
        const res = await CreatorApiService.getCreatorProfile();
        if (res.success && res.data) {
          setCreatorProfile(res.data);
        } else {
          setErrorMessage(res.message || 'Could not load creator profile');
        }
      } else {
        const res = await CreatorApiService.getUserProfile();
        if (res.success && res.data) {
          setUserProfile(res.data);
        } else {
          setErrorMessage(res.message || 'Could not load user profile');
        }
      }
    } catch {
      setErrorMessage('Failed to connect to profile service');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  if (isAuthLoading || (isLoadingProfile && !creatorProfile && !userProfile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs font-mono text-gray-400">Loading your profile data...</p>
      </div>
    );
  }

  // ==========================================
  // STANDARD USER PROFILE VIEW
  // ==========================================
  if (user && user.role !== 'CREATOR') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* User Profile Header Card */}
        <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 p-1 shadow-2xl shrink-0">
              <div className="w-full h-full rounded-xl bg-[#121626] flex items-center justify-center text-3xl font-black text-amber-300">
                {user.name.charAt(0)}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
                  <p className="text-xs font-mono text-gray-400">
                    @{userProfile?.profile?.username || 'member'}
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 self-center sm:self-auto">
                  Community Member
                </span>
              </div>

              {userProfile?.profile?.bio && (
                <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
                  {userProfile.profile.bio}
                </p>
              )}

              {userProfile?.profile?.location && (
                <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{userProfile.profile.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Interests */}
          {userProfile?.profile?.interests && userProfile.profile.interests.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400 block mb-2">
                Creative Interests
              </span>
              <div className="flex flex-wrap gap-1.5">
                {userProfile.profile.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Elevate to Creator Callout */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Are you a Creative Professional?
                </h2>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Unlock professional portfolio showcases, skill proficiency badges, localized collaborator
                discovery, and major project team building on ArtVest by setting up a Creator Profile.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg transition-all text-center whitespace-nowrap"
            >
              Elevate to Creator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CREATOR PROFILE VIEW
  // ==========================================
  if (!creatorProfile) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-400">{errorMessage || 'Could not load creator profile'}</p>
        <button
          onClick={loadProfile}
          className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const primarySkill = creatorProfile.creatorSkills.find((s) => s.isPrimary);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Cover Banner */}
      <div className="h-60 w-full rounded-3xl bg-gradient-to-r from-amber-950/60 via-purple-950/70 to-indigo-950/60 border border-white/10 relative overflow-hidden flex items-end p-6 group">
        {creatorProfile.coverImageUrl && (
          <img
            src={creatorProfile.coverImageUrl}
            alt="Cover banner"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d18] via-transparent to-black/20 pointer-events-none" />

        <div className="flex items-center gap-2 absolute top-4 right-4 z-10">
          <span
            className={`text-xs font-mono px-3 py-1 rounded-xl backdrop-blur-md border flex items-center gap-1.5 ${
              creatorProfile.isPublic
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            {creatorProfile.isPublic ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {creatorProfile.isPublic ? 'Public Profile' : 'Private Profile'}
          </span>
          <Link
            href={`/creator/${creatorProfile.userId}`}
            target="_blank"
            className="text-xs font-mono px-3 py-1 rounded-xl bg-black/60 text-white border border-white/15 hover:border-white/30 backdrop-blur-md flex items-center gap-1.5 transition-colors"
          >
            <span>Public View</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Profile Header Details */}
      <div className="relative px-4 sm:px-8 -mt-16 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-600 p-1 shadow-2xl shrink-0">
              <div className="w-full h-full rounded-xl bg-[#121626] flex items-center justify-center text-3xl font-black text-amber-300 overflow-hidden">
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
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {creatorProfile.stageName || creatorProfile.user.name}
                </h1>
                {creatorProfile.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                )}
              </div>

              {creatorProfile.stageName && creatorProfile.stageName !== creatorProfile.user.name && (
                <p className="text-xs font-mono text-gray-400">Legal: {creatorProfile.user.name}</p>
              )}

              {creatorProfile.headline && (
                <p className="text-xs font-medium text-amber-300/90">{creatorProfile.headline}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-gray-400">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium">
                  {creatorProfile.primaryCategory?.name}
                </span>
                {primarySkill && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <button
              onClick={() => setIsSkillsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Skills ({creatorProfile.creatorSkills.length})</span>
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Profile Strength Card */}
        <div className="mb-6">
          <ProfileStrengthCard
            breakdown={creatorProfile.completionBreakdown}
            onActionClick={() => setIsEditModalOpen(true)}
          />
        </div>

        {/* Profile Nav Tabs */}
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
          <PortfolioSection portfolio={creatorProfile.portfolio} isOwner={true} />
        )}

        {activeTab === 'SKILLS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Verified Skills & Proficiency</h3>
              <button
                onClick={() => setIsSkillsModalOpen(true)}
                className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-semibold"
              >
                + Manage Skills
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {creatorProfile.creatorSkills.map((cs) => (
                <div
                  key={cs.id}
                  className={`p-4 rounded-2xl border transition-all ${
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
                        {cs.yearsExperience} yrs
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ATTRIBUTES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Role-Specific Craft Metadata</h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-semibold"
              >
                Edit Metadata
              </button>
            </div>
            <RoleAttributesDisplay
              categorySlug={creatorProfile.primaryCategory?.slug}
              roleAttributes={creatorProfile.roleAttributes}
            />
          </div>
        )}

        {activeTab === 'ABOUT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">Creative Statement</h3>
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
                    className="text-xs text-amber-300 hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
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
                  <span className="text-emerald-400 font-medium">{creatorProfile.availability.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={creatorProfile}
          onProfileUpdated={loadProfile}
        />
      )}

      {isSkillsModalOpen && (
        <SkillsManagerModal
          isOpen={isSkillsModalOpen}
          onClose={() => setIsSkillsModalOpen(false)}
          skills={creatorProfile.creatorSkills}
          primaryCategoryId={creatorProfile.primaryCategoryId}
          onSkillsUpdated={loadProfile}
        />
      )}
    </div>
  );
}
