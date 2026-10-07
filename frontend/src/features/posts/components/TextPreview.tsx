'use client';

import React from 'react';
import { FileText, Quote } from 'lucide-react';

interface TextPreviewProps {
  title?: string | null;
  caption: string;
  description?: string | null;
  className?: string;
}

export function TextPreview({ title, caption, description, className = '' }: TextPreviewProps) {
  return (
    <div
      className={`rounded-2xl p-6 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 relative overflow-hidden space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono uppercase text-[10px] tracking-wider text-amber-300">
            Creative Writing & Script
          </span>
        </div>
        <Quote className="w-4 h-4 text-white/20" />
      </div>

      {title && (
        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
          {title}
        </h3>
      )}

      <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed font-serif italic border-l-2 border-amber-400/40 pl-4 py-1">
        "{caption}"
      </div>

      {description && (
        <div className="text-xs text-gray-400 font-sans leading-relaxed pt-2 border-t border-white/5">
          {description}
        </div>
      )}
    </div>
  );
}
