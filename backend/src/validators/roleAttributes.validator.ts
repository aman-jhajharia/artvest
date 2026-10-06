import { z } from 'zod';

// ==========================================
// DISCIPLINE SPECIFIC SCHEMAS
// ==========================================

export const SingerRoleSchema = z.object({
  genres: z.array(z.string().trim().min(1)).min(1, 'Select at least one musical genre'),
  languages: z.array(z.string().trim().min(1)).min(1, 'Select at least one vocal language'),
  vocalType: z.string().trim().min(2).optional().nullable(),
});

export const MusicianRoleSchema = z.object({
  instruments: z.array(z.string().trim().min(1)).min(1, 'Select at least one instrument'),
  genres: z.array(z.string().trim().min(1)).min(1, 'Select at least one genre'),
  performanceExperience: z.union([z.string().trim(), z.boolean()]).optional().nullable(),
});

export const MusicProducerRoleSchema = z.object({
  genres: z.array(z.string().trim().min(1)).default([]),
  daws: z.array(z.string().trim().min(1)).min(1, 'Select at least one DAW (Digital Audio Workstation)'),
  productionSpecialties: z.array(z.string().trim().min(1)).default([]),
});

export const PhotographerRoleSchema = z.object({
  // Supports both photographyTypes and photographyStyles for backward compatibility
  photographyTypes: z.array(z.string().trim().min(1)).optional(),
  photographyStyles: z.array(z.string().trim().min(1)).optional(),
  equipment: z.array(z.string().trim().min(1)).default([]),
  editingTools: z.array(z.string().trim().min(1)).default([]),
}).refine(
  (data) => (data.photographyTypes && data.photographyTypes.length > 0) || (data.photographyStyles && data.photographyStyles.length > 0),
  { message: 'Select at least one photography type or style' }
);

export const VideographerRoleSchema = z.object({
  videoStyles: z.array(z.string().trim().min(1)).min(1, 'Select at least one video style'),
  cameraEquipment: z.array(z.string().trim().min(1)).default([]),
  editingTools: z.array(z.string().trim().min(1)).default([]),
});

export const ActorRoleSchema = z.object({
  languages: z.array(z.string().trim().min(1)).min(1, 'Select at least one spoken language'),
  actingStyles: z.array(z.string().trim().min(1)).default([]),
  theatreExperience: z.union([z.boolean(), z.string().trim()]).optional().nullable(),
  filmExperience: z.string().trim().optional().nullable(),
});

export const DirectorRoleSchema = z.object({
  genres: z.array(z.string().trim().min(1)).default([]),
  projectTypes: z.array(z.string().trim().min(1)).min(1, 'Select at least one project type'),
  directingExperience: z.string().trim().optional().nullable(),
});

export const GraphicDesignerRoleSchema = z.object({
  designSpecialties: z.array(z.string().trim().min(1)).min(1, 'Select at least one design specialty'),
  tools: z.array(z.string().trim().min(1)).min(1, 'Select at least one design tool (e.g., Photoshop, Figma)'),
  industries: z.array(z.string().trim().min(1)).default([]),
});

export const AnimatorRoleSchema = z.object({
  animationTypes: z.array(z.string().trim().min(1)).min(1, 'Specify animation type (2D, 3D, Stop-motion, etc.)'),
  software: z.array(z.string().trim().min(1)).min(1, 'Select at least one animation software'),
  animationSpecialties: z.array(z.string().trim().min(1)).default([]),
});

export const VfxArtistRoleSchema = z.object({
  vfxSpecialties: z.array(z.string().trim().min(1)).min(1, 'Select at least one VFX specialty (CGI, Compositing, FX, etc.)'),
  software: z.array(z.string().trim().min(1)).min(1, 'Select at least one VFX software (e.g. Houdini, Nuke, Blender)'),
  pipelineExperience: z.string().trim().optional().nullable(),
});

export const DancerRoleSchema = z.object({
  danceForms: z.array(z.string().trim().min(1)).min(1, 'Select at least one dance form'),
  performanceType: z.string().trim().optional().nullable(),
});

// Extensible fallback schema for other emerging disciplines
export const GeneralCreativeRoleSchema = z.record(
  z.union([
    z.string().trim().max(200),
    z.number(),
    z.boolean(),
    z.array(z.string().trim().max(100)).max(20),
  ])
);

// Map skill slugs to their schemas
export const SKILL_METADATA_SCHEMAS: Record<string, z.ZodTypeAny> = {
  singer: SingerRoleSchema,
  vocalist: SingerRoleSchema,
  musician: MusicianRoleSchema,
  'music-producer': MusicProducerRoleSchema,
  'beat-producer': MusicProducerRoleSchema,
  photographer: PhotographerRoleSchema,
  'photo-editor': PhotographerRoleSchema,
  videographer: VideographerRoleSchema,
  actor: ActorRoleSchema,
  director: DirectorRoleSchema,
  'assistant-director': DirectorRoleSchema,
  'graphic-designer': GraphicDesignerRoleSchema,
  illustrator: GraphicDesignerRoleSchema,
  animator: AnimatorRoleSchema,
  '3d-artist': AnimatorRoleSchema,
  'vfx-artist': VfxArtistRoleSchema,
  dancer: DancerRoleSchema,
  choreographer: DancerRoleSchema,
};

// Map category slugs to unions of discipline schemas
export const CATEGORY_METADATA_SCHEMAS: Record<string, z.ZodTypeAny> = {
  music: z.union([SingerRoleSchema, MusicianRoleSchema, MusicProducerRoleSchema]),
  'film-acting': z.union([ActorRoleSchema, DirectorRoleSchema]),
  'photography-video': z.union([PhotographerRoleSchema, VideographerRoleSchema]),
  'design-digital-arts': z.union([GraphicDesignerRoleSchema, AnimatorRoleSchema, VfxArtistRoleSchema]),
  dance: DancerRoleSchema,
};

/**
 * Validates role-specific attributes based on skill or category slug.
 * Prevents arbitrary or malicious JSON while remaining extensible.
 */
export function validateRoleAttributes(
  discipline: { skillSlug?: string; categorySlug?: string },
  data: unknown
): { isValid: boolean; errors?: string[]; sanitized?: Record<string, unknown> } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Role attributes must be a non-null JSON object'],
    };
  }

  // 1. Try matching by specific skill slug
  if (discipline.skillSlug && SKILL_METADATA_SCHEMAS[discipline.skillSlug]) {
    const schema = SKILL_METADATA_SCHEMAS[discipline.skillSlug];
    const result = schema.safeParse(data);
    if (result.success) {
      return { isValid: true, sanitized: result.data as Record<string, unknown> };
    }
    const formatted = Object.values(result.error.flatten().fieldErrors).flat().filter((e): e is string => typeof e === 'string');
    return { isValid: false, errors: formatted.length > 0 ? formatted : [result.error.message] };
  }

  // 2. Try matching by category slug
  if (discipline.categorySlug && CATEGORY_METADATA_SCHEMAS[discipline.categorySlug]) {
    const schema = CATEGORY_METADATA_SCHEMAS[discipline.categorySlug];
    const result = schema.safeParse(data);
    if (result.success) {
      return { isValid: true, sanitized: result.data as Record<string, unknown> };
    }
  }

  // 3. Fallback to general structured creative schema (prevents arbitrary nested junk)
  const fallbackResult = GeneralCreativeRoleSchema.safeParse(data);
  if (fallbackResult.success) {
    return { isValid: true, sanitized: fallbackResult.data as Record<string, unknown> };
  }

  const errors = Object.values(fallbackResult.error.flatten().fieldErrors).flat().filter((e): e is string => typeof e === 'string');
  return {
    isValid: false,
    errors: errors.length > 0 ? errors : ['Invalid role attributes format'],
  };
}
