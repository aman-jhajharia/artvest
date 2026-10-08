'use client';

import React, { useState } from 'react';
import { PostMediaItem } from '../types/post.types';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { AudioPreview } from './AudioPreview';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface MediaGalleryProps {
  media: PostMediaItem[];
  title?: string;
  className?: string;
}

export function MediaGallery({ media, title, className = '' }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return null;
  }

  const activeMedia = media[currentIndex] || media[0];

  const renderMedia = (item: PostMediaItem) => {
    switch (item.mediaType) {
      case 'VIDEO':
        return <VideoPreview media={item} />;
      case 'AUDIO':
        return <AudioPreview media={item} title={title} />;
      case 'IMAGE':
      default:
        return <ImagePreview media={item} alt={title || 'Showcase media'} />;
    }
  };

  if (media.length === 1) {
    return <div className={className}>{renderMedia(media[0])}</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Active Media Container */}
      <div className="relative">
        {renderMedia(activeMedia)}

        {/* Navigation arrows for multiple items */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Counter badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono text-gray-200 border border-white/10 flex items-center gap-1.5 z-10">
          <Layers className="w-3 h-3 text-amber-400" />
          <span>
            {currentIndex + 1} / {media.length}
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {media.map((item, idx) => (
          <button
            key={item.id || idx}
            type="button"
            className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all relative ${
              idx === currentIndex
                ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20'
                : 'border-white/10 opacity-60 hover:opacity-100'
            }`}
            onClick={() => setCurrentIndex(idx)}
          >
            {item.mediaType === 'IMAGE' ? (
              <img
                src={resolveMediaUrl(item.thumbnailUrl || item.url)}
                alt="thumb"
                className="w-full h-full object-cover"
              />
            ) : item.mediaType === 'VIDEO' ? (
              item.thumbnailUrl ? (
                <img
                  src={resolveMediaUrl(item.thumbnailUrl)}
                  alt="thumb"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-950/60 flex items-center justify-center text-[9px] font-mono text-purple-300">
                  VIDEO
                </div>
              )
            ) : (
              <div className="w-full h-full bg-amber-950/60 flex items-center justify-center text-[9px] font-mono text-amber-300">
                AUDIO
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
