import { z } from 'zod';
import { ExperienceLevel, AvailabilityStatus, PostType } from '@prisma/client';

export const CreatorExploreQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional(), // Alias for q
  category: z.string().trim().max(100).optional(), // Category slug or ID
  categoryId: z.string().trim().max(100).optional(),
  skill: z.string().trim().max(100).optional(), // Skill name, slug, or ID
  skillId: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(), // City or location string
  city: z.string().trim().max(100).optional(),
  experience: z.nativeEnum(ExperienceLevel).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  availability: z.nativeEnum(AvailabilityStatus).optional(),
  proficiency: z.string().trim().max(50).optional(),
  sort: z.enum(['relevance', 'newest', 'profile_strength', 'popular']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreatorExploreQuery = z.infer<typeof CreatorExploreQuerySchema>;

export const PostExploreQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional(), // Alias for q
  category: z.string().trim().max(100).optional(),
  categoryId: z.string().trim().max(100).optional(),
  skill: z.string().trim().max(100).optional(),
  skillId: z.string().trim().max(100).optional(),
  postType: z.nativeEnum(PostType).optional(),
  sort: z.enum(['relevance', 'newest', 'popular']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type PostExploreQuery = z.infer<typeof PostExploreQuerySchema>;

export const ExploreOverviewQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(6),
});

export type ExploreOverviewQuery = z.infer<typeof ExploreOverviewQuerySchema>;
