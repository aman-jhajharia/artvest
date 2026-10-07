'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Film } from 'lucide-react';
import { PostMediaItem } from '../types/post.types';

interface VideoPreviewProps {
  media: PostMediaItem;
  className?: string;
}

export function VideoPreview({ media, className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-black border border-white/10 group aspect-[16/9] ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={media.url}
        poster={media.thumbnailUrl || undefined}
        className="w-full h-full object-cover cursor-pointer"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Center Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all">
          <button
            type="button"
            className="w-16 h-16 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/20 transform hover:scale-110 active:scale-95 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            <Play className="w-8 h-8 fill-black translate-x-0.5" />
          </button>
        </div>
      )}

      {/* Floating Bottom Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            type="button"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <span className="text-[11px] font-mono text-gray-300 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
            <Film className="w-3 h-3 text-purple-400" />
            <span>VIDEO REEL</span>
          </span>
        </div>

        {media.duration && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white">
            {formatDuration(media.duration)}
          </span>
        )}
      </div>
    </div>
  );
}
