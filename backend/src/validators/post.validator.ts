import { z } from 'zod';
import { PostType, PostStatus, MediaType } from '@prisma/client';

export const PostMediaInputSchema = z.object({
  mediaType: z.nativeEnum(MediaType).default(MediaType.IMAGE),
  url: z.string().trim().min(1, 'Media URL is required'),
  thumbnailUrl: z.string().trim().optional().nullable(),
  aspectRatio: z.string().trim().optional().nullable(),
  duration: z.coerce.number().min(0).optional().nullable(),
  orderIndex: z.coerce.number().int().min(0).default(0),
  mimeType: z.string().trim().optional().nullable(),
  fileSize: z.coerce.number().int().min(0).optional().nullable(),
  width: z.coerce.number().int().min(0).optional().nullable(),
  height: z.coerce.number().int().min(0).optional().nullable(),
  meta: z.record(z.unknown()).optional().nullable(),
});

export type PostMediaInput = z.infer<typeof PostMediaInputSchema>;

export const CreatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'Title cannot exceed 120 characters')
    .optional()
    .nullable(),
  caption: z
    .string()
    .trim()
    .max(2000, 'Caption cannot exceed 2000 characters')
    .default(''),
  description: z
    .string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .nullable(),
  postType: z.nativeEnum(PostType).default(PostType.IMAGE),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  categoryId: z.string().trim().optional().nullable(),
  skillIds: z.array(z.string().trim()).default([]),
  tags: z
    .array(
      z
        .string()
        .trim()
        .max(30)
        .regex(/^[a-zA-Z0-9_\-]+$/, 'Tags can only contain alphanumeric characters, underscores, and hyphens')
    )
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  isFeatured: z.boolean().default(false),
  media: z.array(PostMediaInputSchema).default([]),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'Title cannot exceed 120 characters')
    .optional()
    .nullable(),
  caption: z
    .string()
    .trim()
    .max(2000, 'Caption cannot exceed 2000 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .nullable(),
  postType: z.nativeEnum(PostType).optional(),
  categoryId: z.string().trim().optional().nullable(),
  skillIds: z.array(z.string().trim()).optional(),
  tags: z
    .array(z.string().trim().max(30))
    .max(10)
    .optional(),
  isFeatured: z.boolean().optional(),
  media: z.array(PostMediaInputSchema).optional(),
});

export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

export const FeedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  categoryId: z.string().trim().optional(),
  postType: z.nativeEnum(PostType).optional(),
  skillId: z.string().trim().optional(),
});

export type FeedQueryInput = z.infer<typeof FeedQuerySchema>;

export const CreatorPostsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ALL']).default('ALL'),
  isFeatured: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'string' ? val === 'true' : val))
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreatorPostsQueryInput = z.infer<typeof CreatorPostsQuerySchema>;

/**
 * Validates post completeness required before transitioning to PUBLISHED status.
 */
export function validatePostForPublishing(post: {
  title?: string | null;
  caption?: string | null;
  categoryId?: string | null;
  postType: PostType;
  media?: Array<{ mediaType: MediaType }>;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!post.title || post.title.trim().length < 2) {
    errors.push('A descriptive title of at least 2 characters is required to publish.');
  }

  if (!post.caption || post.caption.trim().length < 3) {
    errors.push('A caption or description of at least 3 characters is required to publish.');
  }

  if (!post.categoryId) {
    errors.push('A category must be selected to publish your work to the showcase feed.');
  }

  const mediaList = post.media || [];

  switch (post.postType) {
    case PostType.IMAGE:
      if (!mediaList.some((m) => m.mediaType === MediaType.IMAGE)) {
        errors.push('Image showcase posts must contain at least one uploaded image.');
      }
      break;

    case PostType.VIDEO:
      if (!mediaList.some((m) => m.mediaType === MediaType.VIDEO)) {
        errors.push('Video showcase posts must contain at least one uploaded video file.');
      }
      break;

    case PostType.AUDIO:
      if (!mediaList.some((m) => m.mediaType === MediaType.AUDIO)) {
        errors.push('Audio showcase posts must contain at least one audio track/stem.');
      }
      break;

    case PostType.SHOWCASE:
      if (mediaList.length === 0) {
        errors.push('Showcase portfolios must include at least one media piece.');
      }
      break;

    case PostType.TEXT:
      // Text posts do not require media
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
