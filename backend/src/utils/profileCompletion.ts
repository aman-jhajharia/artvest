export interface CreatorProfileDataForScoring {
  stageName?: string | null;
  bio?: string | null;
  location?: string | null;
  primaryCategoryId?: string | null;
  primarySkillId?: string | null;
  hasAdditionalSkills?: boolean;
  experienceLevel?: string | null;
  availability?: string | null;
  roleAttributes?: Record<string, unknown> | null;
  coverImageUrl?: string | null;
  socialLinks?: Record<string, unknown> | null;
}

/**
 * Deterministic, explainable profile strength calculation for creators.
 * Total points: 100%
 *
 * Scoring breakdown:
 * - Stage Name / Artistic Identity: 10%
 * - Bio (detailed creative statement): 15%
 * - Location (city / country): 10%
 * - Primary Category assigned: 10%
 * - Primary Skill established: 15%
 * - Additional Skills (multi-disciplinary versatility): 10%
 * - Experience Level specified: 10%
 * - Availability status set: 10%
 * - Structured Role Attributes provided: 10%
 */
export function calculateCreatorProfileCompletion(data: CreatorProfileDataForScoring): number {
  let score = 0;

  if (data.stageName && data.stageName.trim().length > 0) score += 10;
  if (data.bio && data.bio.trim().length >= 20) score += 15;
  if (data.location && data.location.trim().length > 0) score += 10;
  if (data.primaryCategoryId) score += 10;
  if (data.primarySkillId) score += 15;
  if (data.hasAdditionalSkills) score += 10;
  if (data.experienceLevel) score += 10;
  if (data.availability) score += 10;

  if (data.roleAttributes && Object.keys(data.roleAttributes).length > 0) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}
