export type PostType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT' | 'SHOWCASE';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export interface PostMediaItem {
  id?: string;
  postId?: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string | null;
  aspectRatio?: string | null;
  duration?: number | null;
  orderIndex?: number;
  mimeType?: string | null;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  meta?: {
    waveform?: number[];
    dimensions?: { width: number; height: number };
    [key: string]: any;
  } | null;
  createdAt?: string;
}

export interface PostItem {
  id: string;
  authorId: string;
  creatorProfileId?: string | null;
  title?: string | null;
  caption: string;
  description?: string | null;
  postType: PostType;
  status: PostStatus;
  categoryId?: string | null;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    role: string;
  };
  creatorProfile?: {
    id: string;
    stageName?: string | null;
    headline?: string | null;
    location?: string | null;
    primaryCategoryId?: string | null;
    primaryCategory?: {
      id: string;
      name: string;
      slug: string;
      themeKey?: string | null;
    } | null;
    isVerified?: boolean;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    themeKey?: string | null;
  } | null;
  skills?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  media: PostMediaItem[];
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  followingCreator?: boolean;
}

export interface CreatePostPayload {
  title?: string;
  caption: string;
  description?: string;
  postType: PostType;
  status?: PostStatus;
  categoryId?: string;
  skillIds?: string[];
  tags?: string[];
  isFeatured?: boolean;
  media?: PostMediaItem[];
}

export interface UpdatePostPayload {
  title?: string;
  caption?: string;
  description?: string;
  categoryId?: string;
  skillIds?: string[];
  tags?: string[];
  isFeatured?: boolean;
  media?: PostMediaItem[];
}

export interface FeedQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  postType?: PostType;
  skillId?: string;
}

export interface CreatorPostsQueryParams {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'ALL';
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export interface UploadedMediaResult {
  mediaUrl: string;
  thumbnailUrl?: string | null;
  mediaType: MediaType;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  waveform?: number[];
  publicId?: string;
}
