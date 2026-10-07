'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { OnboardingService, SkillItem } from '@/features/onboarding/services/onboarding.service';
import { getCategoryMetadataConfig } from '@/features/onboarding/utils/categoryMetadataConfig';
import { Category } from '@/types';
import {
  Sparkles,
  User,
  Palette,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Compass,
  MapPin,
  Award,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, isOnboarded, refreshUser } = useAuth();

  // Navigation step: 1 (Role Intent), 2 (Categories/Skills), 3 (Profile Data), 4 (Review)
  const [step, setStep] = useState(1);
  const [roleIntent, setRoleIntent] = useState<'USER' | 'CREATOR'>('CREATOR');

  // Taxonomy data from Database
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySkills, setCategorySkills] = useState<SkillItem[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  // Common User Form State
  const [userName, setUserName] = useState('');
  const [username, setUsername] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Creator Form State
  const [stageName, setStageName] = useState('');
  const [headline, setHeadline] = useState('');
  const [creatorBio, setCreatorBio] = useState('');
  const [creatorLocation, setCreatorLocation] = useState('Jaipur, Rajasthan');
  const [creatorCity, setCreatorCity] = useState('Jaipur');
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');
  const [yearsExperience, setYearsExperience] = useState(3);
  const [availability, setAvailability] = useState('AVAILABLE_FOR_COLLAB');
  const [primaryCategoryId, setPrimaryCategoryId] = useState('');
  const [primarySkillId, setPrimarySkillId] = useState('');
  const [additionalSkillIds, setAdditionalSkillIds] = useState<string[]>([]);

  // Universal Creative Metadata Form State
  const [specializationsInput, setSpecializationsInput] = useState('Classical, Semi-Classical, Fusion');
  const [practiceContextInput, setPracticeContextInput] = useState('Studio Recording, Live Stage');
  const [toolsInput, setToolsInput] = useState('Acoustic Guitar, Logic Pro, Shure SM7B');
  const [languagesInput, setLanguagesInput] = useState('Hindi, English');

  // Category-Specific Dynamic Inputs
  const [vocalType, setVocalType] = useState('Mezzo-Soprano');
  const [techniquesInput, setTechniquesInput] = useState('');
  const [mediumsInput, setMediumsInput] = useState('');
  const [choreographyRolesInput, setChoreographyRolesInput] = useState('');
  const [certificationsInput, setCertificationsInput] = useState('');

  // Selected Category and dynamic config
  const selectedCategory = categories.find((c) => c.id === primaryCategoryId);
  const categoryConfig = getCategoryMetadataConfig(selectedCategory?.slug);

  // Helper for chip toggling
  const toggleSuggestion = (currentVal: string, suggestion: string, setter: (val: string) => void) => {
    const items = currentVal.split(',').map((s) => s.trim()).filter(Boolean);
    const exists = items.some((item) => item.toLowerCase() === suggestion.toLowerCase());
    if (exists) {
      setter(items.filter((item) => item.toLowerCase() !== suggestion.toLowerCase()).join(', '));
    } else {
      setter(items.length > 0 ? `${items.join(', ')}, ${suggestion}` : suggestion);
    }
  };

  const isSuggestionActive = (currentVal: string, suggestion: string): boolean => {
    const items = currentVal.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    return items.includes(suggestion.toLowerCase());
  };

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If unauthenticated, redirect to login; if already onboarded, redirect to /app
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (isOnboarded) {
        router.replace('/app');
      } else if (user) {
        setUserName(user.name || '');
        setStageName(user.name || '');
        setUsername(user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'));
      }
    }
  }, [authLoading, isAuthenticated, isOnboarded, user, router]);

  // Load Categories from backend
  useEffect(() => {
    async function loadTaxonomy() {
      setTaxonomyLoading(true);
      const res = await OnboardingService.getCategories();
      if (res.success && res.data && res.data.length > 0) {
        setCategories(res.data);
        setPrimaryCategoryId(res.data[0].id);
      }
      setTaxonomyLoading(false);
    }
    loadTaxonomy();
  }, []);

  // When primary category changes, load corresponding skills from backend
  useEffect(() => {
    async function loadSkills() {
      if (!primaryCategoryId) return;
      const res = await OnboardingService.getSkills(primaryCategoryId);
      if (res.success && res.data && res.data.length > 0) {
        setCategorySkills(res.data);
        setPrimarySkillId(res.data[0].id);
        setAdditionalSkillIds([]);
      }
    }
    loadSkills();
  }, [primaryCategoryId]);

  // When primary category changes, preset dynamic metadata suggestions
  useEffect(() => {
    if (!primaryCategoryId || !categories.length) return;
    const cat = categories.find((c) => c.id === primaryCategoryId);
    if (!cat) return;
    const config = getCategoryMetadataConfig(cat.slug);

    if (config.specializationsSuggestions.length > 0) {
      setSpecializationsInput(config.specializationsSuggestions.slice(0, 3).join(', '));
    }
    if (config.practiceContextSuggestions.length > 0) {
      setPracticeContextInput(config.practiceContextSuggestions.slice(0, 2).join(', '));
    }
    if (config.toolsSuggestions.length > 0) {
      setToolsInput(config.toolsSuggestions.slice(0, 3).join(', '));
    }

    // Reset category-specific fields cleanly
    setVocalType(cat.slug === 'music' ? 'Mezzo-Soprano' : '');
    setTechniquesInput(cat.slug === 'film-acting' ? 'Stanislavski Method' : '');
    setChoreographyRolesInput(cat.slug === 'dance' ? 'Choreographer' : '');
    setMediumsInput(
      cat.slug === 'photography-video'
        ? '35mm Film, 4K Raw'
        : cat.slug === 'design-digital-arts'
        ? 'Octane Render, Vector Graphics'
        : ''
    );
    setCertificationsInput(cat.slug === 'production-support' ? 'Dante Certified Level 2' : '');
  }, [primaryCategoryId, categories]);

  // Handle Interest Toggle (for USER)
  const toggleInterest = (catSlug: string) => {
    setSelectedInterests((prev) =>
      prev.includes(catSlug) ? prev.filter((s) => s !== catSlug) : [...prev, catSlug]
    );
  };

  // Handle Additional Skill Toggle (for CREATOR)
  const toggleAdditionalSkill = (skillId: string) => {
    if (skillId === primarySkillId) return;
    setAdditionalSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  // Calculate dynamic profile score preview
  const calculateDynamicScore = (): number => {
    let score = 20; // baseline
    if (stageName.trim()) score += 10;
    if (creatorBio.length >= 20) score += 15;
    if (creatorLocation.trim()) score += 10;
    if (primaryCategoryId) score += 10;
    if (primarySkillId) score += 15;
    if (additionalSkillIds.length > 0) score += 10;
    if (experienceLevel) score += 10;
    return Math.min(100, score);
  };

  // Submit Handler
  const handleSubmitOnboarding = async () => {
    setErrorMsg(null);
    setSubmitting(true);

    if (roleIntent === 'USER') {
      const res = await OnboardingService.submitUserOnboarding({
        name: userName.trim(),
        username: username.trim(),
        bio: userBio.trim() || undefined,
        location: userLocation.trim() || undefined,
        interests: selectedInterests,
      });

      if (res.success) {
        await refreshUser();
        router.push('/app');
      } else {
        setErrorMsg(res.message || 'Failed to complete user onboarding');
        setSubmitting(false);
      }
    } else {
      // Parse universal & category-aware structured role metadata
      const roleAttributes: Record<string, unknown> = {
        specializations: specializationsInput.split(',').map((s) => s.trim()).filter(Boolean),
        genres: specializationsInput.split(',').map((s) => s.trim()).filter(Boolean), // dual-mapped for backward compatibility
        practiceContext: practiceContextInput.split(',').map((s) => s.trim()).filter(Boolean),
        tools: toolsInput.split(',').map((s) => s.trim()).filter(Boolean),
        equipment: toolsInput.split(',').map((s) => s.trim()).filter(Boolean), // dual-mapped for backward compatibility
        languages: languagesInput.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (vocalType.trim()) {
        roleAttributes.vocalType = vocalType.trim();
      }
      if (techniquesInput.trim()) {
        roleAttributes.techniques = techniquesInput.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (mediumsInput.trim()) {
        roleAttributes.mediums = mediumsInput.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (choreographyRolesInput.trim()) {
        roleAttributes.choreographyRoles = choreographyRolesInput.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (certificationsInput.trim()) {
        roleAttributes.certifications = certificationsInput.split(',').map((s) => s.trim()).filter(Boolean);
        roleAttributes.technicalCertifications = certificationsInput.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const res = await OnboardingService.submitCreatorOnboarding({
        stageName: stageName.trim() || undefined,
        headline: headline.trim(),
        bio: creatorBio.trim(),
        location: creatorLocation.trim(),
        city: creatorCity.trim() || undefined,
        experienceLevel,
        yearsExperience: Number(yearsExperience) || 0,
        availability,
        primaryCategoryId,
        primarySkillId,
        additionalSkillIds,
        roleAttributes,
        collaborationPreferences: {
          lookingFor: ['Collaborators', 'Sound Designers', 'Filmmakers'],
          openForRemote: true,
        },
      });

      if (res.success) {
        await refreshUser();
        router.push('/app');
      } else {
        setErrorMsg(res.message || 'Failed to complete creator onboarding');
        setSubmitting(false);
      }
    }
  };

  if (authLoading || taxonomyLoading) {
    return (
      <div className="min-h-screen bg-[#090A10] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-xs font-mono text-gray-400">Loading ArtVest Creative Taxonomy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A10] text-gray-100 selection:bg-amber-500 selection:text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Progress */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">ArtVest Onboarding</h1>
              <p className="text-xs text-gray-400">Set up your creative identity</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  step === s
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Account Intent */}
        {step === 1 && (
          <div className="glass-panel rounded-2xl p-8 border border-white/10 space-y-6">
            <div className="text-center max-w-md mx-auto mb-6">
              <h2 className="text-2xl font-black text-white">What brings you to ArtVest?</h2>
              <p className="text-xs text-gray-400 mt-1.5">
                Choose how you want to interact with the creative ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRoleIntent('CREATOR')}
                className={`p-6 rounded-2xl border text-left transition-all relative ${
                  roleIntent === 'CREATOR'
                    ? 'border-amber-400 bg-amber-500/10 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Showcase My Talent</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  I am a creative professional (vocalist, filmmaker, photographer, dancer, 3D artist, or crew) looking to showcase my portfolio and find collaborators.
                </p>
                <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                  Role: CREATOR
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRoleIntent('USER')}
                className={`p-6 rounded-2xl border text-left transition-all relative ${
                  roleIntent === 'USER'
                    ? 'border-indigo-400 bg-indigo-500/10 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-400'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-400/20 text-indigo-400 flex items-center justify-center mb-4">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Discover & Support Talent</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  I want to discover creative work, follow emerging artists, bookmark showcases, and engage with the creative community.
                </p>
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Role: COMMUNITY MEMBER
                </span>
              </button>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Categories & Skills */}
        {step === 2 && (
          <div className="glass-panel rounded-2xl p-8 border border-white/10 space-y-6">
            {roleIntent === 'USER' ? (
              <div>
                <h2 className="text-xl font-black text-white mb-1">Select Your Creative Interests</h2>
                <p className="text-xs text-gray-400 mb-6">
                  Select the creative disciplines you would like to follow in your feed
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const isSelected = selectedInterests.includes(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleInterest(cat.slug)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-500/15 text-white'
                            : 'border-white/10 bg-white/[0.02] text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">{cat.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-black text-white mb-1">Tell Us About Your Craft</h2>
                <p className="text-xs text-gray-400 mb-6">
                  Choose your primary discipline and specific skills (indexed from ArtVest Database)
                </p>

                {/* Primary Category */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Primary Creative Discipline
                  </label>
                  <select
                    value={primaryCategoryId}
                    onChange={(e) => setPrimaryCategoryId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#121626] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Skill */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Primary Craft Role
                  </label>
                  <select
                    value={primarySkillId}
                    onChange={(e) => setPrimarySkillId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {categorySkills.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#121626] text-white">
                        {s.name} (Primary)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Skills */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Additional Secondary Skills (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills
                      .filter((s) => s.id !== primarySkillId)
                      .map((skill) => {
                        const isAdded = additionalSkillIds.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleAdditionalSkill(skill.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isAdded
                                ? 'bg-amber-400 text-black font-bold'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {isAdded ? `✓ ${skill.name}` : `+ ${skill.name}`}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Profile & Role Details */}
        {step === 3 && (
          <div className="glass-panel rounded-2xl p-8 border border-white/10 space-y-6">
            <h2 className="text-xl font-black text-white mb-1">
              {roleIntent === 'USER' ? 'Your Community Profile' : 'Structured Craft Portfolio'}
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Complete your profile information to enable precise collaborator matching
            </p>

            {roleIntent === 'USER' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Your Full Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="e.g. rohan_music"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Jaipur, Rajasthan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Short Bio</label>
                  <textarea
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Tell the community a little about your creative passions..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Stage / Creative Name
                    </label>
                    <input
                      type="text"
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Aanya Swara"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Location (City, State)
                    </label>
                    <input
                      type="text"
                      value={creatorLocation}
                      onChange={(e) => {
                        setCreatorLocation(e.target.value);
                        setCreatorCity(e.target.value.split(',')[0].trim());
                      }}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Jaipur, Rajasthan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Hindustani Classical & Ambient Fusion Vocalist"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Experience Level
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="BEGINNER" className="bg-[#121626]">Beginner</option>
                      <option value="INTERMEDIATE" className="bg-[#121626]">Intermediate</option>
                      <option value="ADVANCED" className="bg-[#121626]">Advanced</option>
                      <option value="PROFESSIONAL" className="bg-[#121626]">Professional</option>
                      <option value="VETERAN" className="bg-[#121626]">Veteran</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Availability Status
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="AVAILABLE_FOR_COLLAB" className="bg-[#121626]">Available for Collab</option>
                      <option value="OPEN_TO_WORK" className="bg-[#121626]">Open to Work</option>
                      <option value="FREELANCE" className="bg-[#121626]">Freelance</option>
                      <option value="NOT_AVAILABLE" className="bg-[#121626]">Not Available</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Creative Bio (Minimum 10 characters)
                  </label>
                  <textarea
                    value={creatorBio}
                    onChange={(e) => setCreatorBio(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Describe your craft lineage, artistic philosophy, and collaborative vision..."
                  />
                </div>

                {/* Structured Creative Metadata Box */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Structured Creative Attributes — {selectedCategory?.name || 'Craft Profile'}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Category-Adaptive
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Defines your creative taxonomy for discoverability, search filters, and collaborator matching.
                  </p>

                  {/* 1. Specializations & Domains */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        {categoryConfig.specializationsLabel}
                      </label>
                      <span className="text-[10px] text-amber-400/80 font-mono">Core Attribute</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{categoryConfig.specializationsHelper}</p>
                    <input
                      type="text"
                      value={specializationsInput}
                      onChange={(e) => setSpecializationsInput(e.target.value)}
                      placeholder={categoryConfig.specializationsPlaceholder}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    {categoryConfig.specializationsSuggestions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                        {categoryConfig.specializationsSuggestions.map((sug) => {
                          const active = isSuggestionActive(specializationsInput, sug);
                          return (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => toggleSuggestion(specializationsInput, sug, setSpecializationsInput)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                active
                                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {active ? `✓ ${sug}` : `+ ${sug}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. Practice & Presentation Context */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        {categoryConfig.practiceContextLabel}
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">Environment</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{categoryConfig.practiceContextHelper}</p>
                    <input
                      type="text"
                      value={practiceContextInput}
                      onChange={(e) => setPracticeContextInput(e.target.value)}
                      placeholder={categoryConfig.practiceContextPlaceholder}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    {categoryConfig.practiceContextSuggestions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                        {categoryConfig.practiceContextSuggestions.map((sug) => {
                          const active = isSuggestionActive(practiceContextInput, sug);
                          return (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => toggleSuggestion(practiceContextInput, sug, setPracticeContextInput)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                active
                                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {active ? `✓ ${sug}` : `+ ${sug}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Tools, Systems & Equipment */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        {categoryConfig.toolsLabel}
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">Gear & Software</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{categoryConfig.toolsHelper}</p>
                    <input
                      type="text"
                      value={toolsInput}
                      onChange={(e) => setToolsInput(e.target.value)}
                      placeholder={categoryConfig.toolsPlaceholder}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    {categoryConfig.toolsSuggestions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                        {categoryConfig.toolsSuggestions.map((sug) => {
                          const active = isSuggestionActive(toolsInput, sug);
                          return (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => toggleSuggestion(toolsInput, sug, setToolsInput)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                active
                                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {active ? `✓ ${sug}` : `+ ${sug}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 4. Languages & Dialects */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <label className="block text-[11px] font-semibold text-gray-300">
                      {categoryConfig.languagesLabel}
                    </label>
                    <p className="text-[11px] text-gray-400">{categoryConfig.languagesHelper}</p>
                    <input
                      type="text"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      placeholder={categoryConfig.languagesPlaceholder}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 5. Category-Specific Field (Conditionally Rendered) */}
                  {categoryConfig.categorySpecificField && (
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-semibold text-amber-300">
                          {categoryConfig.categorySpecificField.label}
                        </label>
                        <span className="text-[10px] text-amber-400/80 font-mono uppercase tracking-wider">
                          Specific to {selectedCategory?.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {categoryConfig.categorySpecificField.helper}
                      </p>

                      {categoryConfig.categorySpecificField.key === 'vocalType' && (
                        <>
                          <input
                            type="text"
                            value={vocalType}
                            onChange={(e) => setVocalType(e.target.value)}
                            placeholder={categoryConfig.categorySpecificField.placeholder}
                            className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          {categoryConfig.categorySpecificField.suggestions && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                              {categoryConfig.categorySpecificField.suggestions.map((sug) => {
                                const active = vocalType.toLowerCase().includes(sug.toLowerCase());
                                return (
                                  <button
                                    key={sug}
                                    type="button"
                                    onClick={() => setVocalType(active ? '' : sug)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                      active
                                        ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                    }`}
                                  >
                                    {active ? `✓ ${sug}` : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}

                      {categoryConfig.categorySpecificField.key === 'techniques' && (
                        <>
                          <input
                            type="text"
                            value={techniquesInput}
                            onChange={(e) => setTechniquesInput(e.target.value)}
                            placeholder={categoryConfig.categorySpecificField.placeholder}
                            className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          {categoryConfig.categorySpecificField.suggestions && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                              {categoryConfig.categorySpecificField.suggestions.map((sug) => {
                                const active = isSuggestionActive(techniquesInput, sug);
                                return (
                                  <button
                                    key={sug}
                                    type="button"
                                    onClick={() => toggleSuggestion(techniquesInput, sug, setTechniquesInput)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                      active
                                        ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                    }`}
                                  >
                                    {active ? `✓ ${sug}` : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}

                      {categoryConfig.categorySpecificField.key === 'choreographyRoles' && (
                        <>
                          <input
                            type="text"
                            value={choreographyRolesInput}
                            onChange={(e) => setChoreographyRolesInput(e.target.value)}
                            placeholder={categoryConfig.categorySpecificField.placeholder}
                            className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          {categoryConfig.categorySpecificField.suggestions && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                              {categoryConfig.categorySpecificField.suggestions.map((sug) => {
                                const active = isSuggestionActive(choreographyRolesInput, sug);
                                return (
                                  <button
                                    key={sug}
                                    type="button"
                                    onClick={() => toggleSuggestion(choreographyRolesInput, sug, setChoreographyRolesInput)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                      active
                                        ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                    }`}
                                  >
                                    {active ? `✓ ${sug}` : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}

                      {categoryConfig.categorySpecificField.key === 'mediums' && (
                        <>
                          <input
                            type="text"
                            value={mediumsInput}
                            onChange={(e) => setMediumsInput(e.target.value)}
                            placeholder={categoryConfig.categorySpecificField.placeholder}
                            className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          {categoryConfig.categorySpecificField.suggestions && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                              {categoryConfig.categorySpecificField.suggestions.map((sug) => {
                                const active = isSuggestionActive(mediumsInput, sug);
                                return (
                                  <button
                                    key={sug}
                                    type="button"
                                    onClick={() => toggleSuggestion(mediumsInput, sug, setMediumsInput)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                      active
                                        ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                    }`}
                                  >
                                    {active ? `✓ ${sug}` : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}

                      {categoryConfig.categorySpecificField.key === 'certifications' && (
                        <>
                          <input
                            type="text"
                            value={certificationsInput}
                            onChange={(e) => setCertificationsInput(e.target.value)}
                            placeholder={categoryConfig.categorySpecificField.placeholder}
                            className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          {categoryConfig.categorySpecificField.suggestions && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
                              {categoryConfig.categorySpecificField.suggestions.map((sug) => {
                                const active = isSuggestionActive(certificationsInput, sug);
                                return (
                                  <button
                                    key={sug}
                                    type="button"
                                    onClick={() => toggleSuggestion(certificationsInput, sug, setCertificationsInput)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                      active
                                        ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                    }`}
                                  >
                                    {active ? `✓ ${sug}` : `+ ${sug}`}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all flex items-center gap-2"
              >
                <span>Review & Launch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Final Confirmation */}
        {step === 4 && (
          <div className="glass-panel rounded-2xl p-8 border border-white/10 space-y-6">
            <h2 className="text-xl font-black text-white mb-1">Review Your Profile</h2>
            <p className="text-xs text-gray-400 mb-6">
              Verify your information before finalizing onboarding
            </p>

            {roleIntent === 'CREATOR' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Calculated Profile Strength: {calculateDynamicScore()}%
                    </h4>
                    <p className="text-xs text-amber-200/80">
                      Based on verified fields and structured role craft metadata
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-lg">
                  Rank: {experienceLevel}
                </span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Account Role</span>
                <span className="font-bold text-amber-400">{roleIntent}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Name</span>
                <span className="font-semibold text-white">
                  {roleIntent === 'CREATOR' ? stageName : userName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Location</span>
                <span className="text-white">
                  {roleIntent === 'CREATOR' ? creatorLocation : userLocation || 'Unspecified'}
                </span>
              </div>

              {roleIntent === 'CREATOR' && (
                <>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Primary Discipline</span>
                    <span className="text-white font-medium">{selectedCategory?.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Primary Craft Role</span>
                    <span className="text-white font-medium">{categorySkills.find((s) => s.id === primarySkillId)?.name || 'Craft Role'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Specializations</span>
                    <span className="text-amber-400 font-medium text-right max-w-xs truncate">{specializationsInput || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Primary Tools</span>
                    <span className="text-gray-300 font-medium text-right max-w-xs truncate">{toolsInput || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Headline</span>
                    <span className="text-white">{headline || 'Creative Professional'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Availability</span>
                    <span className="text-emerald-400 font-medium">{availability}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitOnboarding}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/25 hover:brightness-105 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Creating your ArtVest profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Onboarding & Enter Platform</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
