'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Eye,
  Save,
  Send,
} from 'lucide-react';
import { PostType, PostMediaItem, PostItem } from '../types/post.types';
import { PostApiService } from '../services/post.service';
import { MediaUploader } from './MediaUploader';
import { MediaGallery } from './MediaGallery';
import { TextPreview } from './TextPreview';

interface CreateShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (post: PostItem) => void;
  initialPost?: PostItem | null;
}

interface TaxonomyCategory {
  id: string;
  name: string;
  slug: string;
}

interface TaxonomySkill {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function CreateShowcaseModal({
  isOpen,
  onClose,
  onSuccess,
  initialPost,
}: CreateShowcaseModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [postType, setPostType] = useState<PostType>('IMAGE');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mediaList, setMediaList] = useState<PostMediaItem[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [skills, setSkills] = useState<TaxonomySkill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (initialPost) {
      setPostType(initialPost.postType);
      setTitle(initialPost.title || '');
      setCaption(initialPost.caption || '');
      setDescription(initialPost.description || '');
      setCategoryId(initialPost.categoryId || '');
      setSelectedSkillIds(initialPost.skills?.map((s) => s.id) || []);
      setTags(initialPost.tags || []);
      setMediaList(initialPost.media || []);
      setIsFeatured(initialPost.isFeatured || false);
    } else {
      setPostType('IMAGE');
      setTitle('');
      setCaption('');
      setDescription('');
      setCategoryId('');
      setSelectedSkillIds([]);
      setTags([]);
      setMediaList([]);
      setIsFeatured(false);
      setCurrentStep(1);
    }
  }, [initialPost, isOpen]);

  // Load categories and skills
  useEffect(() => {
    if (!isOpen) return;

    fetch(`${API_BASE_URL}/categories`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCategories(json.data);
          if (!categoryId && json.data.length > 0) {
            setCategoryId(json.data[0].id);
          }
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/skills`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSkills(json.data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const formatted = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (formatted && !tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  const toggleSkill = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  // Submit action: publish or draft
  const handleSubmit = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    setErrorMsg(null);

    // Validation checks
    if (!caption || caption.trim().length < 3) {
      setErrorMsg('A caption or creative summary is required.');
      setCurrentStep(3);
      return;
    }

    if (targetStatus === 'PUBLISHED') {
      if (!title || title.trim().length < 2) {
        setErrorMsg('A title of at least 2 characters is required to publish.');
        setCurrentStep(3);
        return;
      }
      if (!categoryId) {
        setErrorMsg('Please select a creative category.');
        setCurrentStep(3);
        return;
      }
      if (postType === 'IMAGE' && !mediaList.some((m) => m.mediaType === 'IMAGE')) {
        setErrorMsg('Image posts must have at least one uploaded image.');
        setCurrentStep(2);
        return;
      }
      if (postType === 'VIDEO' && !mediaList.some((m) => m.mediaType === 'VIDEO')) {
        setErrorMsg('Video posts must contain a video reel file.');
        setCurrentStep(2);
        return;
      }
      if (postType === 'AUDIO' && !mediaList.some((m) => m.mediaType === 'AUDIO')) {
        setErrorMsg('Audio posts must contain an audio track.');
        setCurrentStep(2);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        caption: caption.trim(),
        description: description.trim() || undefined,
        postType,
        status: targetStatus,
        categoryId: categoryId || undefined,
        skillIds: selectedSkillIds,
        tags,
        isFeatured,
        media: mediaList,
      };

      let res;
      if (initialPost?.id) {
        res = await PostApiService.updatePost(initialPost.id, payload);
        if (res.success && targetStatus === 'PUBLISHED' && initialPost.status !== 'PUBLISHED') {
          res = await PostApiService.publishPost(initialPost.id);
        }
      } else {
        res = await PostApiService.createPost(payload);
      }

      if (!res.success || !res.data) {
        throw new Error(res.message || (typeof res.error?.details === 'string' ? res.error.details : 'Failed to save showcase'));
      }

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving showcase post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSkills = categoryId
    ? skills.filter((s) => s.categoryId === categoryId)
    : skills;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="rounded-3xl bg-[#0f0f13] border border-white/10 w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialPost ? 'Edit Creative Showcase' : 'Create Creative Showcase'}
              </h2>
              <p className="text-xs text-gray-400">Step {currentStep} of 5: Multimedia Publishing Flow</p>
            </div>
          </div>

          <button
            type="button"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-5 border-b border-white/10 text-center text-[11px] font-mono">
          {[
            { num: 1, label: '1. Type' },
            { num: 2, label: '2. Media' },
            { num: 3, label: '3. Details' },
            { num: 4, label: '4. Preview' },
            { num: 5, label: '5. Publish' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              className={`py-2.5 transition-colors border-b-2 font-semibold ${
                currentStep === s.num
                  ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                  : currentStep > s.num
                  ? 'border-emerald-400/60 text-emerald-300'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setCurrentStep(s.num)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* STEP 1: CONTENT TYPE */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Choose Showcase Format</h3>
                <p className="text-xs text-gray-400">
                  Select the creative medium that best represents this work
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    type: 'IMAGE' as PostType,
                    icon: ImageIcon,
                    title: 'Visual Art & Stills',
                    desc: 'Photography, 3D renders, digital paintings, concept sketches',
                    color: 'text-blue-400',
                  },
                  {
                    type: 'VIDEO' as PostType,
                    icon: Film,
                    title: 'Video Reel & Motion',
                    desc: 'Cinematography showreels, animations, dance choreography',
                    color: 'text-purple-400',
                  },
                  {
                    type: 'AUDIO' as PostType,
                    icon: Music,
                    title: 'Audio Stem & Track',
                    desc: 'Vocal demos, acoustic stems, electronic compositions, podcasts',
                    color: 'text-amber-400',
                  },
                  {
                    type: 'TEXT' as PostType,
                    icon: FileText,
                    title: 'Literary & Script',
                    desc: 'Screenplay excerpts, poetry, essays, artistic manifestos',
                    color: 'text-emerald-400',
                  },
                  {
                    type: 'SHOWCASE' as PostType,
                    icon: Layers,
                    title: 'Multimedia Showcase',
                    desc: 'Combined project containing multiple media assets & behind the scenes',
                    color: 'text-pink-400',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = postType === item.type;
                  return (
                    <div
                      key={item.type}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                      onClick={() => setPostType(item.type)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white flex items-center justify-between">
                            <span>{item.title}</span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-amber-400" />}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: MEDIA UPLOADER */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Attach Creative Media</h3>
                <p className="text-xs text-gray-400">
                  {postType === 'TEXT'
                    ? 'Text posts do not require media files. You may proceed directly to details or add optional supporting stills.'
                    : `Upload your files for ${postType} showcase`}
                </p>
              </div>

              <MediaUploader
                postType={postType}
                mediaList={mediaList}
                onChange={(newList) => setMediaList(newList)}
              />
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1.5">
                  Showcase Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raag Yaman Exploration with Ambient Textures"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1.5">
                  Creative Summary / Caption <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize your creative vision, techniques, and background..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              {/* Extended Description */}
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1.5">
                  Extended Process Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Gear used, recording setup, collaborators, or inspiration..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              {/* Category & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1.5">
                    Creative Category <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#14141a] border border-white/10 text-white focus:outline-none focus:border-amber-400 text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400"
                    />
                    <span>Feature at top of Creator Portfolio</span>
                  </label>
                </div>
              </div>

              {/* Skills Association */}
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1.5">
                  Associated Skills
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/10">
                  {filteredSkills.map((s) => {
                    const active = selectedSkillIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkill(s.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                          active
                            ? 'bg-amber-400 text-black font-semibold'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1.5">Tags</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tags (press Enter or Add)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1 font-mono"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-400 ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Showcase Live Preview</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Verify how your showcase will render in feed and profile
                  </p>
                </div>
                {isFeatured && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    Featured Spotlight
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4">
                {title && (
                  <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
                )}

                {/* Media rendering */}
                {postType === 'TEXT' ? (
                  <TextPreview title={title} caption={caption} description={description} />
                ) : (
                  <MediaGallery media={mediaList} title={title} />
                )}

                <p className="text-sm text-gray-300 leading-relaxed">{caption}</p>

                {description && postType !== 'TEXT' && (
                  <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-2">
                    {description}
                  </p>
                )}

                {/* Tags & Skills */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                  {tags.map((t) => (
                    <span key={t} className="text-[11px] font-mono text-amber-300/80">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SAVE DRAFT / PUBLISH */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-white">Ready to Save or Publish</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You can save this work as a private draft in your Creator Studio to continue editing later, or publish it immediately to the public showcase feed and portfolio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit('DRAFT')}
                  className="px-4 py-3 rounded-2xl bg-white/5 border border-white/15 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-gray-400" />
                  <span>Save as Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit('PUBLISHED')}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-black text-xs font-bold shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Send className="w-4 h-4 fill-black" />
                  )}
                  <span>Publish Showcase</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <button
            type="button"
            disabled={currentStep === 1 || isSubmitting}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-400/20"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('PUBLISHED')}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-400/20"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 fill-black" />}
              <span>Publish Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
