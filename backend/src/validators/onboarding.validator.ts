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

// Universal & Category-Aware Creative Metadata Schema
export const CreativeRoleAttributesSchema = z
  .object({
    // 1. Universal Creative Attributes
    specializations: z.array(z.string().trim()).max(20).optional().default([]),
    genres: z.array(z.string().trim()).max(20).optional().default([]),
    languages: z.array(z.string().trim()).max(20).optional().default([]),
    tools: z.array(z.string().trim()).max(30).optional().default([]),
    equipment: z.array(z.string().trim()).max(30).optional().default([]),
    practiceContext: z.array(z.string().trim()).max(20).optional().default([]),
    productionContext: z.array(z.string().trim()).max(20).optional().default([]),
    techniques: z.array(z.string().trim()).max(20).optional().default([]),
    mediums: z.array(z.string().trim()).max(20).optional().default([]),

    // 2. Discipline-Specific Attributes (Optional, category-aware)
    vocalType: z.string().trim().max(100).optional().nullable(),
    vocalRange: z.string().trim().max(100).optional().nullable(),
    classicalTradition: z.string().trim().max(100).optional().nullable(),
    instruments: z.array(z.string().trim()).max(20).optional().default([]),
    daws: z.array(z.string().trim()).max(20).optional().default([]),

    cameraGear: z.array(z.string().trim()).max(20).optional().default([]),
    cameraSystems: z.array(z.string().trim()).max(20).optional().default([]),
    editingSuite: z.string().trim().max(100).optional().nullable(),
    editingTools: z.array(z.string().trim()).max(20).optional().default([]),
    actingStyles: z.array(z.string().trim()).max(20).optional().default([]),
    projectTypes: z.array(z.string().trim()).max(20).optional().default([]),

    danceForms: z.array(z.string().trim()).max(20).optional().default([]),
    performanceContext: z.array(z.string().trim()).max(20).optional().default([]),
    choreographyRoles: z.array(z.string().trim()).max(20).optional().default([]),

    photographyStyles: z.array(z.string().trim()).max(20).optional().default([]),
    photographyTypes: z.array(z.string().trim()).max(20).optional().default([]),
    videoStyles: z.array(z.string().trim()).max(20).optional().default([]),
    cameraEquipment: z.array(z.string().trim()).max(20).optional().default([]),

    designSpecialties: z.array(z.string().trim()).max(20).optional().default([]),
    software: z.array(z.string().trim()).max(20).optional().default([]),
    animationTypes: z.array(z.string().trim()).max(20).optional().default([]),

    productionSpecialties: z.array(z.string().trim()).max(20).optional().default([]),
    gear: z.array(z.string().trim()).max(20).optional().default([]),
    technicalCertifications: z.array(z.string().trim()).max(20).optional().default([]),
    certifications: z.array(z.string().trim()).max(20).optional().default([]),
  })
  .passthrough();

export const RoleAttributesSchema = CreativeRoleAttributesSchema;

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
  roleAttributes: CreativeRoleAttributesSchema.default({}),
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
