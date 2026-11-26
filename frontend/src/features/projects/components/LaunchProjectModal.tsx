'use client';

import React, { useState, useEffect } from 'react';
import { ProjectApiService } from '../services/project.service';
import { Category } from '@/types';
import { API_BASE_URL } from '@/config/api';
import { X, Sparkles, AlertCircle, Rocket, Loader2 } from 'lucide-react';

interface LaunchProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const LaunchProjectModal: React.FC<LaunchProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fundingGoal, setFundingGoal] = useState<number>(10000);
  const [totalShares, setTotalShares] = useState<number>(10000);
  const [categoryId, setCategoryId] = useState<string>('');
  const [coverMediaUrl, setCoverMediaUrl] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
          if (json.data.length > 0 && !categoryId) {
            setCategoryId(json.data[0].id);
          }
        }
      } catch {
        // Silently catch taxonomy load
      }
    };
    fetchCategories();
  }, [isOpen, categoryId]);

  if (!isOpen) return null;

  const isMultipleOf500 = fundingGoal >= 500 && fundingGoal % 500 === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isMultipleOf500) {
      setErrorMessage('Funding goal must be at least 500 and a strict multiple of 500 ArtCredits.');
      return;
    }

    if (title.trim().length < 3) {
      setErrorMessage('Title must be at least 3 characters.');
      return;
    }

    if (description.trim().length < 10) {
      setErrorMessage('Description must be at least 10 characters.');
      return;
    }

    if (!deadline || new Date(deadline).getTime() <= Date.now()) {
      setErrorMessage('Funding cutoff deadline is required and must be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ProjectApiService.createProject({
        title: title.trim(),
        description: description.trim(),
        fundingGoal,
        totalShares,
        categoryId: categoryId || null,
        coverMediaUrl: coverMediaUrl.trim() || null,
        deadline: new Date(deadline).toISOString(),
      });

      if (res.success) {
        onCreated();
        onClose();
      } else {
        setErrorMessage(
          res.error?.details
            ? String(res.error.details)
            : res.message || 'Failed to launch project'
        );
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to launch project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12131C] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pitch a Creative Project</h3>
              <p className="text-xs text-gray-400">Launch a community fractional funding campaign</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300 block">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dhwani: Acoustic Folk EP"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300 block">Discipline / Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#12131C] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300 block">Creative Pitch & Vision *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you are producing, timeline, deliverables, and how backers participate..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Funding Goal & Shares */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-300 block">Goal (ArtCredits) *</label>
                <span className="text-[10px] text-amber-400 font-mono">Multiple of 500</span>
              </div>
              <input
                type="number"
                step={500}
                min={500}
                required
                value={fundingGoal}
                onChange={(e) => setFundingGoal(Number(e.target.value) || 0)}
                className={`w-full bg-black/40 border rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none ${
                  !isMultipleOf500 ? 'border-red-500' : 'border-white/10 focus:border-amber-400'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 block">Total Share Pool</label>
              <input
                type="number"
                min={100}
                value={totalShares}
                onChange={(e) => setTotalShares(Number(e.target.value) || 10000)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Cover Media URL */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300 block">Cover Media Image URL (Optional)</label>
            <input
              type="url"
              value={coverMediaUrl}
              onChange={(e) => setCoverMediaUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-300 block">Funding Cutoff Deadline</label>
              <span className="text-[11px] text-amber-400 font-medium">Exact date & time required</span>
            </div>
            <input
              type="datetime-local"
              required
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-gray-400">
              Pledges automatically refund if 100% goal is not met by this exact time.
            </p>
          </div>

          {/* Validation Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isMultipleOf500}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                isMultipleOf500 && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching Pitch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Pitch to Marketplace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
