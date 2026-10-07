'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { PostMediaItem } from '../types/post.types';

interface AudioPreviewProps {
  media: PostMediaItem;
  className?: string;
  title?: string;
}

export function AudioPreview({ media, className = '', title }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.duration || 0);
  const [isMuted, setIsMuted] = useState(false);

  // Generate or read waveform bars (default 48 bars)
  const waveform: number[] =
    media.meta?.waveform && Array.isArray(media.meta.waveform) && media.meta.waveform.length > 0
      ? media.meta.waveform.slice(0, 48)
      : [
          0.3, 0.45, 0.7, 0.9, 0.6, 0.8, 0.4, 0.5, 0.65, 0.85, 1.0, 0.75, 0.55, 0.4, 0.6, 0.8, 0.95,
          0.7, 0.5, 0.65, 0.8, 0.9, 0.7, 0.55, 0.45, 0.6, 0.75, 0.85, 0.65, 0.5, 0.6, 0.7, 0.8,
          0.9, 0.6, 0.45, 0.55, 0.7, 0.8, 0.65, 0.5, 0.4, 0.55, 0.7, 0.8, 0.6, 0.4, 0.3,
        ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seekTo = (fraction: number) => {
    if (!audioRef.current || !duration) return;
    const target = fraction * duration;
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressFraction = duration > 0 ? currentTime / duration : 0;

  return (
    <div
      className={`rounded-2xl p-5 bg-gradient-to-br from-black/80 via-white/[0.03] to-white/[0.01] border border-white/10 shadow-xl relative overflow-hidden ${className}`}
    >
      <audio ref={audioRef} src={media.url} preload="metadata" />

      {/* Decorative vinyl/ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-4">
        {/* Play / Pause circular action */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg ${
            isPlaying
              ? 'bg-amber-400 text-black shadow-amber-500/30 scale-95'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 hover:scale-105'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Track info & Waveform visualizer */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="p-1 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                <Music className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-white truncate">
                {title || 'Audio Stem / Track'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <button
                type="button"
                onClick={toggleMute}
                className="p-1 rounded text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Interactive Waveform Bars */}
          <div
            className="flex items-end gap-1 h-12 py-1 cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              seekTo(Math.max(0, Math.min(1, clickX / rect.width)));
            }}
          >
            {waveform.map((amp, index) => {
              const barFraction = index / waveform.length;
              const isPast = barFraction <= progressFraction;
              const heightPercent = Math.max(15, Math.round(amp * 100));

              return (
                <div
                  key={index}
                  style={{ height: `${heightPercent}%` }}
                  className={`flex-1 rounded-full transition-all duration-100 ${
                    isPast
                      ? 'bg-gradient-to-t from-amber-500 to-amber-300 group-hover:brightness-110 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-white/15 group-hover:bg-white/25'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
