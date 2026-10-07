'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  PlusCircle,
  Star,
  Layers,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Clock,
} from 'lucide-react';
import { MediaGallery } from '@/features/posts/components/MediaGallery';
import { TextPreview } from '@/features/posts/components/TextPreview';
import { CreateShowcaseModal } from '@/features/posts/components/CreateShowcaseModal';

interface PortfolioSectionProps {
  portfolio?: any[];
  isOwner?: boolean;
}

export function PortfolioSection({ portfolio = [], isOwner = false }: PortfolioSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredWorks = portfolio.filter((item) => item.isFeatured);
  const otherWorks = portfolio.filter((item) => !item.isFeatured);

  const renderCard = (item: any) => {
    const hasMedia = item.media && item.media.length > 0;

    return (
      <div
        key={item.id}
        className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all group"
      >
        <div>
          {/* Media Header */}
          {item.postType === 'TEXT' ? (
            <div className="p-4 bg-white/[0.02]">
              <TextPreview
                title={item.title}
                caption={item.caption}
                description={item.description}
              />
            </div>
          ) : hasMedia ? (
            <div className="p-3 bg-black/40">
              <MediaGallery media={item.media} title={item.title || undefined} />
            </div>
          ) : (
            <div className="h-40 bg-white/[0.02] flex flex-col items-center justify-center gap-2 text-gray-500">
              <Sparkles className="w-8 h-8 text-amber-400/40" />
              <span className="text-xs font-mono">{item.postType}</span>
            </div>
          )}

          {/* Details */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                {item.postType}
              </span>

              {item.isFeatured && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  Featured
                </span>
              )}
            </div>

            {item.title && (
              <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-amber-300 transition-colors">
                {item.title}
              </h4>
            )}

            <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
              {item.caption}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
          {item.category && (
            <span className="text-[11px] font-mono text-gray-400 truncate">
              {item.category.name}
            </span>
          )}

          <span className="text-[11px] font-mono flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Showcase Portfolio</h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Phase 3 Live
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Curated featured works, audio stems, showreels, and creative milestones
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2.5">
            <Link
              href="/app/studio"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Manage Studio</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-black text-xs font-bold shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Publish Showcase</span>
            </button>
          </div>
        )}
      </div>

      {portfolio.length > 0 ? (
        <div className="space-y-8">
          {/* 1. FEATURED WORK */}
          {featuredWorks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 border-b border-amber-400/20 pb-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold tracking-wider uppercase">Featured Work</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredWorks.map((item) => renderCard(item))}
              </div>
            </div>
          )}

          {/* 2. OTHER WORK */}
          {otherWorks.length > 0 && (
            <div className="space-y-4">
              {featuredWorks.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 border-b border-white/10 pb-2">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span className="font-bold tracking-wider uppercase">Other Work & Milestones</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherWorks.map((item) => renderCard(item))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">
              {isOwner ? 'Add your first creative work.' : "This creator hasn't published any work yet."}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isOwner
                ? 'Upload visual art, audio stems, video reels, or scripts to build your professional portfolio.'
                : 'Check back soon to explore published creative showcases, audio stems, and showreels from this creator.'}
            </p>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5 shadow-md shadow-amber-400/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Showcase</span>
            </button>
          )}
        </div>
      )}

      {/* Creation Modal */}
      {isOwner && (
        <CreateShowcaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
