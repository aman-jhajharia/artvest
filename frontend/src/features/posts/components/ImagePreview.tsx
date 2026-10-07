'use client';

import React, { useState } from 'react';
import { Maximize2, Image as ImageIcon, X } from 'lucide-react';
import { PostMediaItem } from '../types/post.types';

interface ImagePreviewProps {
  media: PostMediaItem;
  className?: string;
  alt?: string;
}

export function ImagePreview({ media, className = '', alt = 'Showcase artwork' }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Derive aspect ratio class if available
  const getAspectRatioClass = () => {
    if (!media.aspectRatio) return 'aspect-[16/9]';
    if (media.aspectRatio === '1:1') return 'aspect-square';
    if (media.aspectRatio === '4:5') return 'aspect-[4/5]';
    if (media.aspectRatio === '9:16') return 'aspect-[9/16]';
    return 'aspect-[16/9]';
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl bg-black/40 border border-white/10 group cursor-pointer ${getAspectRatioClass()} ${className}`}
        onClick={() => setIsLightboxOpen(true)}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white/20 animate-spin" />
          </div>
        )}

        {/* Fallback state */}
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/[0.02]">
            <ImageIcon className="w-10 h-10 text-white/20" />
            <span className="text-xs font-mono text-gray-400">Media preview unavailable</span>
          </div>
        ) : (
          <img
            src={media.url}
            alt={alt}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Hover overlay with zoom button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="p-3 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Format badge */}
        {media.aspectRatio && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gray-300 pointer-events-none">
            {media.aspectRatio}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={media.url}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
