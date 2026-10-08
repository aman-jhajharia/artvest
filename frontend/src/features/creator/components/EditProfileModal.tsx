'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  Sliders,
  Globe,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Eye,
} from 'lucide-react';
import { FullCreatorProfile, UpdateCreatorProfilePayload } from '../types/creator.types';
import { CreatorApiService } from '../services/creator.service';
import { ExperienceLevel, AvailabilityStatus } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FullCreatorProfile;
  onProfileUpdated: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'CRAFT' | 'METADATA' | 'LINKS'>('IDENTITY');

  // Discipline & Craft detection
  const categorySlug = profile.primaryCategory?.slug;
  const primarySkillSlug = profile.creatorSkills?.find((s) => s.isPrimary)?.skill?.slug;
  const isDance =
    categorySlug === 'dance' ||
    primarySkillSlug === 'dancer' ||
    primarySkillSlug === 'choreographer';

  // Form State
  const [stageName, setStageName] = useState(profile.stageName || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [city, setCity] = useState(profile.city || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel);
  const [yearsExperience, setYearsExperience] = useState<number>(profile.yearsExperience || 0);
  const [availability, setAvailability] = useState<AvailabilityStatus>(profile.availability);
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImageUrl || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [isPublic, setIsPublic] = useState(profile.isPublic ?? true);

  // Social Links
  const [spotify, setSpotify] = useState((profile.socialLinks as any)?.spotify || '');
  const [youtube, setYoutube] = useState((profile.socialLinks as any)?.youtube || '');
  const [instagram, setInstagram] = useState((profile.socialLinks as any)?.instagram || '');

  // Role attributes state (helpers)
  const existingAttrs = (profile.roleAttributes as Record<string, any>) || {};

  // Dance-specific attributes state
  const [danceFormsInput, setDanceFormsInput] = useState(() => {
    if (Array.isArray(existingAttrs.danceForms)) {
      return existingAttrs.danceForms.join(', ');
    }
    if (Array.isArray(existingAttrs.specializations)) {
      return existingAttrs.specializations.join(', ');
    }
    return '';
  });

  const [performanceTypeInput, setPerformanceTypeInput] = useState(() => {
    if (typeof existingAttrs.performanceType === 'string' && existingAttrs.performanceType.trim()) {
      return existingAttrs.performanceType.trim();
    }
    if (Array.isArray(existingAttrs.practiceContext)) {
      const firstVal = existingAttrs.practiceContext.find(
        (s: unknown) => typeof s === 'string' && (s as string).trim()
      );
      return firstVal ? String(firstVal).trim() : '';
    }
    if (typeof existingAttrs.practiceContext === 'string' && existingAttrs.practiceContext.trim()) {
      return existingAttrs.practiceContext.trim();
    }
    return '';
  });

  // Music/general attributes state (preserved for non-Dance creators)
  const [genresInput, setGenresInput] = useState(
    Array.isArray(existingAttrs.genres) ? existingAttrs.genres.join(', ') : ''
  );
  const [languagesInput, setLanguagesInput] = useState(
    Array.isArray(existingAttrs.languages) ? existingAttrs.languages.join(', ') : ''
  );
  const [vocalType, setVocalType] = useState(existingAttrs.vocalType || '');
  const [toolsInput, setToolsInput] = useState(
    Array.isArray(existingAttrs.tools || existingAttrs.editingTools)
      ? (existingAttrs.tools || existingAttrs.editingTools).join(', ')
      : ''
  );
  const [equipmentInput, setEquipmentInput] = useState(
    Array.isArray(existingAttrs.equipment || existingAttrs.cameraEquipment)
      ? (existingAttrs.equipment || existingAttrs.cameraEquipment).join(', ')
      : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    // Build role attributes based on discipline inputs
    let roleAttributesPayload: Record<string, any>;

    if (isDance) {
      const parsedDanceForms = danceFormsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (parsedDanceForms.length === 0) {
        setFeedback({ type: 'error', message: 'Add at least one dance form.' });
        setIsSubmitting(false);
        return;
      }

      roleAttributesPayload = {
        danceForms: parsedDanceForms,
        ...(performanceTypeInput.trim() ? { performanceType: performanceTypeInput.trim() } : {}),
      };
    } else {
      roleAttributesPayload = { ...existingAttrs };
      if (genresInput.trim()) {
        roleAttributesPayload.genres = genresInput.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (languagesInput.trim()) {
        roleAttributesPayload.languages = languagesInput.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (vocalType.trim()) {
        roleAttributesPayload.vocalType = vocalType.trim();
      }
      if (toolsInput.trim()) {
        roleAttributesPayload.editingTools = toolsInput.split(',').map((s: string) => s.trim()).filter(Boolean);
        roleAttributesPayload.tools = toolsInput.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (equipmentInput.trim()) {
        roleAttributesPayload.equipment = equipmentInput.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const payload: UpdateCreatorProfilePayload = {
      stageName: stageName.trim() || null,
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      city: city.trim() || null,
      experienceLevel,
      yearsExperience: Number(yearsExperience),
      availability,
      coverImageUrl: coverImageUrl.trim() || null,
      website: website.trim() || null,
      socialLinks: {
        ...(spotify ? { spotify: spotify.trim() } : {}),
        ...(youtube ? { youtube: youtube.trim() } : {}),
        ...(instagram ? { instagram: instagram.trim() } : {}),
      },
      roleAttributes: Object.keys(roleAttributesPayload).length > 0 ? roleAttributesPayload : undefined,
      isPublic,
    };

    try {
      const res = await CreatorApiService.updateCreatorProfile(payload);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Creator profile updated successfully!' });
        onProfileUpdated();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: res.error?.details ? String(res.error.details) : res.message || 'Failed to update profile',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'An unexpected network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121626] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Edit Creator Profile</h2>
              <p className="text-xs text-gray-400">Update your artistic identity, discipline attributes, and visibility</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-white/[0.01] px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('IDENTITY')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'IDENTITY'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Identity & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CRAFT')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'CRAFT'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Experience
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('METADATA')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'METADATA'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Craft Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LINKS')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'LINKS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Media & Links
          </button>
        </div>

        {/* Alert Feedback */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'IDENTITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Stage or Artistic Name
                  </label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="e.g. Aria Voice"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Classical & Fusion Vocalist"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Creative Bio (min 10 characters)
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your creative lineage, craft philosophy, and what drives your art..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Working Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CRAFT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="BEGINNER" className="bg-[#121626]">Beginner</option>
                    <option value="INTERMEDIATE" className="bg-[#121626]">Intermediate</option>
                    <option value="ADVANCED" className="bg-[#121626]">Advanced</option>
                    <option value="PROFESSIONAL" className="bg-[#121626]">Professional</option>
                    <option value="VETERAN" className="bg-[#121626]">Veteran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Years of Active Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Collaboration Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="AVAILABLE_FOR_COLLAB" className="bg-[#121626]">
                    Available for Collaboration
                  </option>
                  <option value="OPEN_TO_WORK" className="bg-[#121626]">Open to Work</option>
                  <option value="FREELANCE" className="bg-[#121626]">Freelance Projects</option>
                  <option value="COMMISSION" className="bg-[#121626]">Commissions Only</option>
                  <option value="NOT_AVAILABLE" className="bg-[#121626]">Not Currently Available</option>
                </select>
              </div>

              {/* Privacy Setting */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Eye className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-xs font-semibold text-white">Public Creator Profile</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Allow discovery and collaboration requests from other community members.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-amber-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'METADATA' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Discipline-specific metadata allows ArtVest to match you with matching collaborators and creative teams.
              </p>

              {isDance ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Dance Forms & Movement Styles <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={danceFormsInput}
                      onChange={(e) => setDanceFormsInput(e.target.value)}
                      placeholder="e.g. Hip-Hop, Contemporary, Freestyle, Kathak"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Core movement forms and styles in your repertoire (comma separated, at least one required)
                    </p>
                    {!danceFormsInput.trim() && (
                      <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
                        Add at least one dance form.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Performance Type / Context
                    </label>
                    <input
                      type="text"
                      value={performanceTypeInput}
                      onChange={(e) => setPerformanceTypeInput(e.target.value)}
                      placeholder="e.g. Solo Performance, Stage, Competition, Dance Film"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Settings where your movement practice or choreography is presented
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Genres or Artistic Styles (comma separated)
                    </label>
                    <input
                      type="text"
                      value={genresInput}
                      onChange={(e) => setGenresInput(e.target.value)}
                      placeholder="e.g. Classical, Fusion, Ambient, Cinematic"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Spoken or Vocal Languages (comma separated)
                    </label>
                    <input
                      type="text"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      placeholder="e.g. Hindi, Sanskrit, English"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">
                        Vocal Register / Specialty
                      </label>
                      <input
                        type="text"
                        value={vocalType}
                        onChange={(e) => setVocalType(e.target.value)}
                        placeholder="e.g. Soprano, Baritone"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">
                        Production Tools / DAWs / Software
                      </label>
                      <input
                        type="text"
                        value={toolsInput}
                        onChange={(e) => setToolsInput(e.target.value)}
                        placeholder="e.g. Logic Pro, Ableton, Premiere"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Equipment / Gear / Instruments
                    </label>
                    <input
                      type="text"
                      value={equipmentInput}
                      onChange={(e) => setEquipmentInput(e.target.value)}
                      placeholder="e.g. Tanpura, Neumann U87, Sony FX3"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'LINKS' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Personal Website / Portfolio URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourportfolio.art"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                  Social & Platform Links
                </span>
                <input
                  type="url"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="Spotify Artist URL"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="YouTube Channel URL"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram Profile URL"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
