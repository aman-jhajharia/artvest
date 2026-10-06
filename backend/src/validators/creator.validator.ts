import { z } from 'zod';
import { ExperienceLevel, AvailabilityStatus } from '@prisma/client';

export const UpdateCreatorProfileSchema = z.object({
  stageName: z.string().trim().min(2, 'Stage name must be at least 2 characters').max(60).optional().nullable(),
  headline: z.string().trim().min(3, 'Headline must be at least 3 characters').max(120).optional(),
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters').max(1000).optional(),
  location: z.string().trim().min(2, 'Location must be at least 2 characters').max(100).optional(),
  city: z.string().trim().max(60).optional().nullable(),
  country: z.string().trim().max(60).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  availability: z.nativeEnum(AvailabilityStatus).optional(),
  primaryCategoryId: z.string().trim().min(1).optional(),
  coverImageUrl: z.string().url('Must be a valid image URL').optional().nullable(),
  website: z.string().url('Must be a valid URL').optional().nullable(),
  socialLinks: z.record(z.string().trim()).optional().nullable(),
  collaborationPreferences: z
    .object({
      lookingFor: z.array(z.string().trim()).default([]),
      openForRemote: z.boolean().default(true),
    })
    .optional()
    .nullable(),
  roleAttributes: z.record(z.unknown()).optional().nullable(),
  isPublic: z.boolean().optional(),
});

export type UpdateCreatorProfileInput = z.infer<typeof UpdateCreatorProfileSchema>;

export const AddCreatorSkillSchema = z.object({
  skillId: z.string().trim().min(1, 'Skill ID is required'),
  isPrimary: z.boolean().default(false),
  proficiency: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .default('INTERMEDIATE'),
  yearsExperience: z.coerce.number().int().min(0).max(60).default(0),
});

export type AddCreatorSkillInput = z.infer<typeof AddCreatorSkillSchema>;

export const UpdateCreatorSkillSchema = z.object({
  isPrimary: z.boolean().optional(),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
});

export type UpdateCreatorSkillInput = z.infer<typeof UpdateCreatorSkillSchema>;
