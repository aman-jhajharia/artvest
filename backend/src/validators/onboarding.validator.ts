import { z } from 'zod';
import { ExperienceLevel, AvailabilityStatus } from '@prisma/client';

export const UserOnboardingSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  bio: z.string().trim().max(300, 'Bio cannot exceed 300 characters').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters').optional().nullable(),
  interests: z.array(z.string().trim()).max(10, 'Maximum 10 interests allowed').default([]),
});

export type UserOnboardingInput = z.infer<typeof UserOnboardingSchema>;

// Category-aware Role Metadata Schemas
export const SingerMetadataSchema = z.object({
  genres: z.array(z.string().trim()).min(1, 'Select at least one musical genre'),
  languages: z.array(z.string().trim()).min(1, 'Select at least one vocal language'),
  vocalType: z.string().trim().min(2, 'Vocal type is required').optional(),
});

export const PhotographerMetadataSchema = z.object({
  photographyStyles: z.array(z.string().trim()).min(1, 'Select at least one photography style'),
  equipment: z.array(z.string().trim()).default([]),
  specializations: z.array(z.string().trim()).default([]),
});

export const FilmActorMetadataSchema = z.object({
  languages: z.array(z.string().trim()).min(1, 'Select at least one language'),
  actingStyles: z.array(z.string().trim()).default([]),
  theatreExperience: z.boolean().default(false),
  cameraSystems: z.array(z.string().trim()).default([]),
});

export const DancerMetadataSchema = z.object({
  danceForms: z.array(z.string().trim()).min(1, 'Select at least one dance form'),
  performanceType: z.string().trim().optional(),
});

export const DigitalArtistMetadataSchema = z.object({
  tools: z.array(z.string().trim()).default([]),
  engines: z.array(z.string().trim()).default([]),
  focus: z.string().trim().optional(),
});

export const ProductionCrewMetadataSchema = z.object({
  gear: z.array(z.string().trim()).default([]),
  fieldExperience: z.string().trim().optional(),
});

export const RoleAttributesSchema = z.union([
  SingerMetadataSchema,
  PhotographerMetadataSchema,
  FilmActorMetadataSchema,
  DancerMetadataSchema,
  DigitalArtistMetadataSchema,
  ProductionCrewMetadataSchema,
  z.record(z.unknown()), // Extensible fallback for emerging categories
]);

export const CreatorOnboardingSchema = z.object({
  stageName: z.string().trim().min(2, 'Stage or creative name must be at least 2 characters').max(60).optional().nullable(),
  headline: z.string().trim().min(3, 'Headline must be at least 3 characters').max(120, 'Headline cannot exceed 120 characters'),
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio cannot exceed 1000 characters'),
  location: z.string().trim().min(2, 'Location is required').max(100),
  city: z.string().trim().max(60).optional().nullable(),
  country: z.string().trim().max(60).default('India'),
  experienceLevel: z.nativeEnum(ExperienceLevel, {
    errorMap: () => ({ message: 'Valid experience level is required' }),
  }),
  yearsExperience: z.coerce.number().int().min(0, 'Years of experience cannot be negative').max(60).default(0),
  availability: z.nativeEnum(AvailabilityStatus, {
    errorMap: () => ({ message: 'Valid availability status is required' }),
  }),
  primaryCategoryId: z.string().trim().min(1, 'Primary category is required'),
  primarySkillId: z.string().trim().min(1, 'Primary skill is required'),
  additionalSkillIds: z.array(z.string().trim()).max(10, 'Maximum 10 additional skills allowed').default([]),
  roleAttributes: z.record(z.unknown()).default({}),
  collaborationPreferences: z
    .object({
      lookingFor: z.array(z.string().trim()).default([]),
      openForRemote: z.boolean().default(true),
    })
    .optional()
    .default({ lookingFor: [], openForRemote: true }),
  socialLinks: z.record(z.string().trim()).optional().default({}),
});

export type CreatorOnboardingInput = z.infer<typeof CreatorOnboardingSchema>;
