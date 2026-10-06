'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Star,
  Trash2,
  Award,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { CreatorSkillRelation } from '../types/creator.types';
import { CreatorApiService } from '../services/creator.service';

interface SkillsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: CreatorSkillRelation[];
  primaryCategoryId: string;
  onSkillsUpdated: () => void;
}

export function SkillsManagerModal({
  isOpen,
  onClose,
  skills,
  primaryCategoryId,
  onSkillsUpdated,
}: SkillsManagerModalProps) {
  const [taxonomySkills, setTaxonomySkills] = useState<Array<{ id: string; name: string; slug: string; categoryId: string }>>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');
  const [selectedYears, setSelectedYears] = useState(1);
  const [isPrimaryNew, setIsPrimaryNew] = useState(false);

  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTaxonomySkills();
      setFeedback(null);
    }
  }, [isOpen]);

  const loadTaxonomySkills = async () => {
    setIsLoadingTaxonomy(true);
    try {
      const res = await CreatorApiService.getSkills();
      if (res.success && res.data) {
        setTaxonomySkills(res.data);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoadingTaxonomy(false);
    }
  };

  if (!isOpen) return null;

  // Filter out skills the creator already possesses
  const availableTaxonomy = taxonomySkills.filter(
    (taxSkill) => !skills.some((cs) => cs.skillId === taxSkill.id)
  );

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) {
      setFeedback({ type: 'error', message: 'Please select a skill from taxonomy' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await CreatorApiService.addCreatorSkill({
        skillId: selectedSkillId,
        proficiency: selectedProficiency,
        yearsExperience: selectedYears,
        isPrimary: isPrimaryNew,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Skill successfully added to profile!' });
        setSelectedSkillId('');
        setIsPrimaryNew(false);
        onSkillsUpdated();
      } else {
        setFeedback({
          type: 'error',
          message: res.error?.details ? String(res.error.details) : res.message || 'Failed to add skill',
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'An unexpected network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePrimary = async (skill: CreatorSkillRelation) => {
    if (skill.isPrimary) return; // Already primary

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await CreatorApiService.updateCreatorSkill(skill.skillId, {
        isPrimary: true,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: `Marked ${skill.skill.name} as your primary craft!` });
        onSkillsUpdated();
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to update primary skill. Note: Primary skill must belong to your main category.',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Could not update primary skill' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skill: CreatorSkillRelation) => {
    if (skill.isPrimary && skills.length > 1) {
      setFeedback({
        type: 'error',
        message: 'Cannot remove your primary skill. Please designate another skill as primary first.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await CreatorApiService.deleteCreatorSkill(skill.skillId);
      if (res.success) {
        setFeedback({ type: 'success', message: `Removed ${skill.skill.name} from your profile.` });
        onSkillsUpdated();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to remove skill' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Could not delete skill' });
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Manage Creative Skills</h2>
              <p className="text-xs text-gray-400">Add, elevate, and fine-tune your multidisciplinary repertoire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Skills List */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
              Active Profile Skills ({skills.length})
            </h3>
            <div className="space-y-2">
              {skills.map((cs) => (
                <div
                  key={cs.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    cs.isPrimary
                      ? 'bg-amber-500/[0.04] border-amber-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePrimary(cs)}
                      title={cs.isPrimary ? 'Primary Craft' : 'Click to set as primary'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        cs.isPrimary
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-amber-300'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${cs.isPrimary ? 'fill-amber-300' : ''}`} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{cs.skill.name}</span>
                        {cs.isPrimary && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Primary Craft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1 font-mono text-[11px] text-gray-300">
                          <Award className="w-3 h-3 text-purple-400" />
                          {cs.proficiency || 'INTERMEDIATE'}
                        </span>
                        {cs.yearsExperience !== null && cs.yearsExperience !== undefined && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                            <Clock className="w-3 h-3 text-blue-400" />
                            {cs.yearsExperience} {cs.yearsExperience === 1 ? 'yr' : 'yrs'} exp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!cs.isPrimary && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDeleteSkill(cs)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Skill Section */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Skill to Profile
            </h3>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Select Skill
                  </label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    disabled={isLoadingTaxonomy || isSubmitting}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="" className="bg-[#121626]">
                      {isLoadingTaxonomy ? 'Loading skills...' : '-- Choose from taxonomy --'}
                    </option>
                    {availableTaxonomy.map((item) => (
                      <option key={item.id} value={item.id} className="bg-[#121626]">
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Proficiency Level
                  </label>
                  <select
                    value={selectedProficiency}
                    onChange={(e) => setSelectedProficiency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="BEGINNER" className="bg-[#121626]">Beginner</option>
                    <option value="INTERMEDIATE" className="bg-[#121626]">Intermediate</option>
                    <option value="ADVANCED" className="bg-[#121626]">Advanced</option>
                    <option value="EXPERT" className="bg-[#121626]">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Years Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={selectedYears}
                    onChange={(e) => setSelectedYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="isPrimaryNew"
                    checked={isPrimaryNew}
                    onChange={(e) => setIsPrimaryNew(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="isPrimaryNew" className="text-xs text-gray-300 cursor-pointer">
                    Set as primary craft
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedSkillId}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding Skill...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Skill
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
