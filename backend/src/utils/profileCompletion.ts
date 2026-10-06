export interface CreatorProfileDataForScoring {
  stageName?: string | null;
  headline?: string | null;
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
  hasPortfolioOrShowcase?: boolean;
}

export interface CompletionChecklistItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  tip: string;
}

export interface ProfileCompletionBreakdown {
  score: number;
  checklist: CompletionChecklistItem[];
  missingItems: string[];
  rank: 'Emerging Talent' | 'Active Creative' | 'Established Creator' | 'Master Portfolio';
}

/**
 * Deterministic, explainable profile strength calculation for creators.
 * Total points: 100%
 */
export function calculateCreatorProfileCompletion(data: CreatorProfileDataForScoring): number {
  let score = 0;

  if (data.stageName && data.stageName.trim().length > 0) score += 10;
  if (data.headline && data.headline.trim().length > 0) score += 5;
  if (data.bio && data.bio.trim().length >= 20) score += 10;
  if (data.location && data.location.trim().length > 0) score += 10;
  if (data.primaryCategoryId) score += 10;
  if (data.primarySkillId) score += 10;
  if (data.hasAdditionalSkills) score += 10;
  if (data.experienceLevel) score += 10;
  if (data.availability) score += 10;

  if (data.roleAttributes && Object.keys(data.roleAttributes).length > 0) {
    score += 10;
  }

  if (data.coverImageUrl && data.coverImageUrl.trim().length > 0) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Returns explainable breakdown and actionable checklist for profile strength.
 */
export function getCreatorProfileCompletionBreakdown(
  data: CreatorProfileDataForScoring
): ProfileCompletionBreakdown {
  const checklist: CompletionChecklistItem[] = [
    {
      id: 'stageName',
      label: 'Stage or Creative Name',
      points: 10,
      completed: Boolean(data.stageName && data.stageName.trim().length > 0),
      tip: 'Establish your artistic alias or personal brand name.',
    },
    {
      id: 'headline',
      label: 'Professional Headline',
      points: 5,
      completed: Boolean(data.headline && data.headline.trim().length > 0),
      tip: 'Add a concise tagline describing your creative specialty.',
    },
    {
      id: 'primarySkill',
      label: 'Primary Craft Role',
      points: 10,
      completed: Boolean(data.primarySkillId),
      tip: 'Designate your core artistic discipline (e.g. Classical Vocalist, Cinematographer).',
    },
    {
      id: 'bio',
      label: 'Creative Bio & Lineage',
      points: 10,
      completed: Boolean(data.bio && data.bio.trim().length >= 20),
      tip: 'Write a description of at least 20 characters about your craft philosophy.',
    },
    {
      id: 'primaryCategory',
      label: 'Discipline Category',
      points: 10,
      completed: Boolean(data.primaryCategoryId),
      tip: 'Connect with your primary ecosystem category.',
    },
    {
      id: 'location',
      label: 'Location & Working Base',
      points: 10,
      completed: Boolean(data.location && data.location.trim().length > 0),
      tip: 'Set your primary city to enable localized collaborator matching.',
    },
    {
      id: 'additionalSkills',
      label: 'Secondary Skills & Versatility',
      points: 10,
      completed: Boolean(data.hasAdditionalSkills),
      tip: 'Add at least one secondary skill (e.g. Composer, Sound Editor).',
    },
    {
      id: 'experienceLevel',
      label: 'Experience Level',
      points: 10,
      completed: Boolean(data.experienceLevel),
      tip: 'Specify your career seniority (Beginner, Intermediate, Professional, Veteran).',
    },
    {
      id: 'availability',
      label: 'Collaboration Availability',
      points: 10,
      completed: Boolean(data.availability),
      tip: 'Indicate whether you are open for collaboration, freelance, or commissions.',
    },
    {
      id: 'roleAttributes',
      label: 'Discipline-Specific Craft Attributes',
      points: 10,
      completed: Boolean(data.roleAttributes && Object.keys(data.roleAttributes).length > 0),
      tip: 'Provide specialized metadata (genres, languages, vocal types, camera systems).',
    },
    {
      id: 'coverImageUrl',
      label: 'Visual Cover Banner',
      points: 5,
      completed: Boolean(data.coverImageUrl && data.coverImageUrl.trim().length > 0),
      tip: 'Upload a cover banner showcasing your artistic identity.',
    },
  ];

  const score = checklist.reduce((sum, item) => (item.completed ? sum + item.points : sum), 0);
  const missingItems = checklist.filter((item) => !item.completed).map((item) => item.tip);

  let rank: ProfileCompletionBreakdown['rank'] = 'Emerging Talent';
  if (score >= 90) rank = 'Master Portfolio';
  else if (score >= 70) rank = 'Established Creator';
  else if (score >= 40) rank = 'Active Creative';

  return {
    score: Math.min(100, score),
    checklist,
    missingItems,
    rank,
  };
}
