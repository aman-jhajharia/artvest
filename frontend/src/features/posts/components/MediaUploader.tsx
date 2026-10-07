'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Film, Music, AlertCircle } from 'lucide-react';
import { PostMediaItem, MediaType, PostType } from '../types/post.types';
import { PostApiService } from '../services/post.service';

interface MediaUploaderProps {
  postType: PostType;
  mediaList: PostMediaItem[];
  onChange: (media: PostMediaItem[]) => void;
  maxFiles?: number;
}

const FILE_LIMITS = {
  IMAGE: { label: 'Images (JPEG, PNG, WebP, GIF)', accept: 'image/jpeg,image/png,image/webp,image/gif', maxSize: 10 * 1024 * 1024, maxLabel: '10MB' },
  VIDEO: { label: 'Videos (MP4, WebM, MOV)', accept: 'video/mp4,video/webm,video/quicktime', maxSize: 100 * 1024 * 1024, maxLabel: '100MB' },
  AUDIO: { label: 'Audio (MP3, WAV, FLAC, AAC, OGG)', accept: 'audio/mpeg,audio/wav,audio/flac,audio/aac,audio/ogg', maxSize: 50 * 1024 * 1024, maxLabel: '50MB' },
};

export function MediaUploader({ postType, mediaList, onChange, maxFiles = 8 }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getAcceptString = () => {
    switch (postType) {
      case 'IMAGE':
        return FILE_LIMITS.IMAGE.accept;
      case 'VIDEO':
        return FILE_LIMITS.VIDEO.accept;
      case 'AUDIO':
        return FILE_LIMITS.AUDIO.accept;
      case 'SHOWCASE':
      default:
        return `${FILE_LIMITS.IMAGE.accept},${FILE_LIMITS.VIDEO.accept},${FILE_LIMITS.AUDIO.accept}`;
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    if (mediaList.length + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} media items allowed per showcase.`);
      return;
    }

    setIsUploading(true);

    try {
      const newItems: PostMediaItem[] = [...mediaList];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate client size limit
        let targetType: MediaType = 'IMAGE';
        if (file.type.startsWith('video/')) targetType = 'VIDEO';
        else if (file.type.startsWith('audio/')) targetType = 'AUDIO';

        const limit = FILE_LIMITS[targetType] || FILE_LIMITS.IMAGE;
        if (file.size > limit.maxSize) {
          throw new Error(`${file.name} exceeds ${limit.maxLabel} maximum size limit.`);
        }

        const res = await PostApiService.uploadMedia(file, targetType);

        if (!res.success || !res.data) {
          throw new Error(res.message || (typeof res.error?.details === 'string' ? res.error.details : 'Failed to upload file'));
        }

        const uploaded = res.data;
        newItems.push({
          mediaType: uploaded.mediaType,
          url: uploaded.mediaUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          aspectRatio: uploaded.width && uploaded.height ? `${uploaded.width}:${uploaded.height}` : undefined,
          duration: uploaded.duration,
          orderIndex: newItems.length,
          mimeType: uploaded.mimeType,
          fileSize: uploaded.fileSize,
          width: uploaded.width,
          height: uploaded.height,
          meta: uploaded.waveform ? { waveform: uploaded.waveform } : null,
        });
      }

      onChange(newItems);
    } catch (err: any) {
      setUploadError(err.message || 'Error occurred while uploading media.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeMedia = (index: number) => {
    const updated = mediaList.filter((_, idx) => idx !== index).map((item, idx) => ({
      ...item,
      orderIndex: idx,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
          isDragging
            ? 'border-amber-400 bg-amber-400/5 scale-[1.01]'
            : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.03]'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={postType === 'SHOWCASE' || postType === 'IMAGE'}
          accept={getAcceptString()}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            ) : postType === 'VIDEO' ? (
              <Film className="w-6 h-6 text-purple-400" />
            ) : postType === 'AUDIO' ? (
              <Music className="w-6 h-6 text-amber-400" />
            ) : (
              <Upload className="w-6 h-6 text-amber-400" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {isUploading ? 'Uploading & Processing Media...' : 'Drag & drop media files, or browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports {postType === 'AUDIO' ? 'MP3, WAV, FLAC (up to 50MB)' : postType === 'VIDEO' ? 'MP4, WebM (up to 100MB)' : 'JPEG, PNG, WebP (up to 10MB)'}
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Media Thumbnails */}
      {mediaList.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-400">Attached Media ({mediaList.length})</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mediaList.map((item, index) => (
              <div
                key={item.id || index}
                className="relative rounded-xl overflow-hidden border border-white/10 group bg-black/40 aspect-video flex items-center justify-center"
              >
                {item.mediaType === 'IMAGE' ? (
                  <img src={item.url} alt="Uploaded item" className="w-full h-full object-cover" />
                ) : item.mediaType === 'VIDEO' ? (
                  <div className="flex flex-col items-center gap-1 text-purple-400">
                    <Film className="w-6 h-6" />
                    <span className="text-[10px] font-mono">Video File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-amber-400">
                    <Music className="w-6 h-6" />
                    <span className="text-[10px] font-mono">Audio Track</span>
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 hover:bg-red-500 text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(index);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Index badge */}
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-gray-300 border border-white/10">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
