import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/apiResponse.js';
import {
  UpdateCreatorProfileInput,
  AddCreatorSkillInput,
  UpdateCreatorSkillInput,
} from '../validators/creator.validator.js';
import { validateRoleAttributes } from '../validators/roleAttributes.validator.js';
import {
  calculateCreatorProfileCompletion,
  getCreatorProfileCompletionBreakdown,
} from '../utils/profileCompletion.js';

export class CreatorService {
  /**
   * Retrieves the authenticated creator's profile, skills, portfolio foundation, and completion breakdown.
   */
  public static async getCreatorProfileByUserId(userId: string) {
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        primaryCategory: true,
        creatorSkills: {
          include: {
            skill: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    themeKey: true,
                  },
                },
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            isOnboarded: true,
            createdAt: true,
            posts: {
              where: { isFeatured: true },
              include: {
                media: true,
                category: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 12,
            },
          },
        },
      },
    });

    if (!creatorProfile) {
      throw new AppError('Creator profile not found for this account', 404, 'CREATOR_PROFILE_NOT_FOUND');
    }

    const primarySkill = creatorProfile.creatorSkills.find((s) => s.isPrimary);
    const completionBreakdown = getCreatorProfileCompletionBreakdown({
      stageName: creatorProfile.stageName,
      headline: creatorProfile.headline,
      bio: creatorProfile.bio,
      location: creatorProfile.location,
      primaryCategoryId: creatorProfile.primaryCategoryId,
      primarySkillId: primarySkill?.skillId || null,
      hasAdditionalSkills: creatorProfile.creatorSkills.some((s) => !s.isPrimary),
      experienceLevel: creatorProfile.experienceLevel,
      availability: creatorProfile.availability,
      roleAttributes: (creatorProfile.roleAttributes as Record<string, unknown>) || null,
      coverImageUrl: creatorProfile.coverImageUrl,
      socialLinks: (creatorProfile.socialLinks as Record<string, unknown>) || null,
    });

    return {
      ...creatorProfile,
      portfolio: creatorProfile.user.posts || [],
      completionBreakdown,
    };
  }

  /**
   * Retrieves public creator profile by creatorId or userId (respects privacy isPublic flag).
   */
  public static async getPublicCreatorProfile(identifier: string, requesterUserId?: string) {
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: {
        OR: [{ id: identifier }, { userId: identifier }],
      },
      include: {
        primaryCategory: true,
        creatorSkills: {
          include: {
            skill: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    themeKey: true,
                  },
                },
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
            posts: {
              where: { isFeatured: true },
              include: {
                media: true,
                category: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 12,
            },
          },
        },
      },
    });

    if (!creatorProfile) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_NOT_FOUND');
    }

    // Privacy check
    if (!creatorProfile.isPublic && creatorProfile.userId !== requesterUserId) {
      throw new AppError('This creator profile is private', 403, 'PROFILE_PRIVATE');
    }

    // Atomically increment view count (fire and forget update)
    await prisma.creatorProfile
      .update({
        where: { id: creatorProfile.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return {
      ...creatorProfile,
      portfolio: creatorProfile.user.posts || [],
    };
  }

  /**
   * Updates the authenticated creator's profile partially and recomputes completion score.
   */
  public static async updateCreatorProfile(userId: string, input: UpdateCreatorProfileInput) {
    const existing = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        creatorSkills: {
          include: { skill: true },
        },
      },
    });

    if (!existing) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_PROFILE_NOT_FOUND');
    }

    // Validate category if updating primaryCategoryId
    let categorySlug: string | undefined;
    if (input.primaryCategoryId && input.primaryCategoryId !== existing.primaryCategoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: input.primaryCategoryId },
      });
      if (!categoryExists) {
        throw new AppError('Specified category does not exist', 400, 'INVALID_CATEGORY');
      }
      categorySlug = categoryExists.slug;
    } else {
      const currentCategory = await prisma.category.findUnique({
        where: { id: existing.primaryCategoryId },
      });
      categorySlug = currentCategory?.slug;
    }

    // Validate roleAttributes against creator discipline if provided
    let validatedRoleAttributes: Record<string, unknown> | undefined = undefined;
    if (input.roleAttributes !== undefined && input.roleAttributes !== null) {
      const primarySkill = existing.creatorSkills.find((s) => s.isPrimary);
      const validation = validateRoleAttributes(
        { categorySlug, skillSlug: primarySkill?.skill.slug },
        input.roleAttributes
      );

      if (!validation.isValid) {
        throw new AppError(
          `Invalid role-specific metadata: ${validation.errors?.join(', ') || 'validation failed'}`,
          400,
          'INVALID_ROLE_ATTRIBUTES'
        );
      }
      validatedRoleAttributes = validation.sanitized;
    }

    // Merge attributes for recomputing score
    const primarySkill = existing.creatorSkills.find((s) => s.isPrimary);
    const updatedScore = calculateCreatorProfileCompletion({
      stageName: input.stageName !== undefined ? input.stageName : existing.stageName,
      headline: input.headline !== undefined ? input.headline : existing.headline,
      bio: input.bio !== undefined ? input.bio : existing.bio,
      location: input.location !== undefined ? input.location : existing.location,
      primaryCategoryId: input.primaryCategoryId || existing.primaryCategoryId,
      primarySkillId: primarySkill?.skillId || null,
      hasAdditionalSkills: existing.creatorSkills.some((s) => !s.isPrimary),
      experienceLevel: input.experienceLevel || existing.experienceLevel,
      availability: input.availability || existing.availability,
      roleAttributes:
        validatedRoleAttributes !== undefined
          ? validatedRoleAttributes
          : (existing.roleAttributes as Record<string, unknown>),
      coverImageUrl: input.coverImageUrl !== undefined ? input.coverImageUrl : existing.coverImageUrl,
      socialLinks:
        input.socialLinks !== undefined ? input.socialLinks : (existing.socialLinks as Record<string, unknown>),
    });

    return prisma.$transaction(async (tx) => {
      // Update CreatorProfile
      const updatedProfile = await tx.creatorProfile.update({
        where: { userId },
        data: {
          stageName: input.stageName !== undefined ? input.stageName : undefined,
          headline: input.headline,
          bio: input.bio,
          location: input.location,
          city: input.city !== undefined ? input.city : undefined,
          country: input.country,
          experienceLevel: input.experienceLevel,
          yearsExperience: input.yearsExperience,
          availability: input.availability,
          primaryCategoryId: input.primaryCategoryId,
          coverImageUrl: input.coverImageUrl !== undefined ? input.coverImageUrl : undefined,
          website: input.website !== undefined ? input.website : undefined,
          socialLinks: input.socialLinks !== undefined ? (input.socialLinks as Prisma.InputJsonValue) : undefined,
          roleAttributes:
            validatedRoleAttributes !== undefined
              ? (validatedRoleAttributes as Prisma.InputJsonValue)
              : undefined,
          collaborationPreferences:
            input.collaborationPreferences !== undefined
              ? (input.collaborationPreferences as Prisma.InputJsonValue)
              : undefined,
          isPublic: input.isPublic,
          profileCompletionScore: updatedScore,
        },
        include: {
          primaryCategory: true,
          creatorSkills: {
            include: {
              skill: {
                include: { category: true },
              },
            },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      });

      // Synchronize User.name if stageName was updated
      if (input.stageName) {
        await tx.user.update({
          where: { id: userId },
          data: { name: input.stageName },
        });
      }

      return updatedProfile;
    });
  }

  /**
   * Retrieves creator skills list for the authenticated creator.
   */
  public static async getCreatorSkills(userId: string) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!creator) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_PROFILE_NOT_FOUND');
    }

    return prisma.creatorSkill.findMany({
      where: { creatorProfileId: creator.id },
      include: {
        skill: {
          include: { category: true },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Adds a skill to the creator's profile, preventing duplicates and validating category constraint.
   */
  public static async addCreatorSkill(userId: string, input: AddCreatorSkillInput) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: { creatorSkills: true },
    });

    if (!creator) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_PROFILE_NOT_FOUND');
    }

    // Validate skill existence
    const skill = await prisma.skill.findUnique({
      where: { id: input.skillId },
      include: { category: true },
    });

    if (!skill) {
      throw new AppError('Skill does not exist in taxonomy', 404, 'SKILL_NOT_FOUND');
    }

    // Check duplicate
    const alreadyExists = creator.creatorSkills.some((s) => s.skillId === input.skillId);
    if (alreadyExists) {
      throw new AppError('Skill is already added to creator profile', 409, 'DUPLICATE_CREATOR_SKILL');
    }

    // If marked as primary, ensure skill belongs to primary category
    if (input.isPrimary && skill.categoryId !== creator.primaryCategoryId) {
      throw new AppError(
        'Primary skill must belong to the creator\'s primary category',
        400,
        'SKILL_CATEGORY_MISMATCH'
      );
    }

    return prisma.$transaction(async (tx) => {
      // If marking as primary, unset existing primary skill
      if (input.isPrimary) {
        await tx.creatorSkill.updateMany({
          where: { creatorProfileId: creator.id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const newSkill = await tx.creatorSkill.create({
        data: {
          creatorProfileId: creator.id,
          skillId: input.skillId,
          isPrimary: input.isPrimary,
          proficiency: input.proficiency,
          yearsExperience: input.yearsExperience,
        },
        include: {
          skill: {
            include: { category: true },
          },
        },
      });

      // Recalculate and update completion score
      const allSkills = [...creator.creatorSkills, newSkill];
      const primary = allSkills.find((s) => s.isPrimary);
      const score = calculateCreatorProfileCompletion({
        stageName: creator.stageName,
        headline: creator.headline,
        bio: creator.bio,
        location: creator.location,
        primaryCategoryId: creator.primaryCategoryId,
        primarySkillId: primary?.skillId || null,
        hasAdditionalSkills: allSkills.some((s) => !s.isPrimary),
        experienceLevel: creator.experienceLevel,
        availability: creator.availability,
        roleAttributes: creator.roleAttributes as Record<string, unknown>,
      });

      await tx.creatorProfile.update({
        where: { id: creator.id },
        data: { profileCompletionScore: score },
      });

      return newSkill;
    });
  }

  /**
   * Updates an existing creator skill (e.g. toggle isPrimary, update proficiency or experience).
   */
  public static async updateCreatorSkill(userId: string, skillId: string, input: UpdateCreatorSkillInput) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        creatorSkills: {
          include: { skill: true },
        },
      },
    });

    if (!creator) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_PROFILE_NOT_FOUND');
    }

    const existingSkill = creator.creatorSkills.find((s) => s.skillId === skillId);
    if (!existingSkill) {
      throw new AppError('Skill is not associated with this creator profile', 404, 'CREATOR_SKILL_NOT_FOUND');
    }

    // Category constraint check if elevating to primary
    if (input.isPrimary === true && existingSkill.skill.categoryId !== creator.primaryCategoryId) {
      throw new AppError(
        'Primary skill must belong to the creator\'s primary category',
        400,
        'SKILL_CATEGORY_MISMATCH'
      );
    }

    return prisma.$transaction(async (tx) => {
      // If setting this skill to primary, unset others first
      if (input.isPrimary === true) {
        await tx.creatorSkill.updateMany({
          where: { creatorProfileId: creator.id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const updated = await tx.creatorSkill.update({
        where: { id: existingSkill.id },
        data: {
          isPrimary: input.isPrimary,
          proficiency: input.proficiency,
          yearsExperience: input.yearsExperience,
        },
        include: {
          skill: {
            include: { category: true },
          },
        },
      });

      return updated;
    });
  }

  /**
   * Removes a secondary skill from creator profile.
   */
  public static async deleteCreatorSkill(userId: string, skillId: string) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: { creatorSkills: true },
    });

    if (!creator) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_PROFILE_NOT_FOUND');
    }

    const targetSkill = creator.creatorSkills.find((s) => s.skillId === skillId);
    if (!targetSkill) {
      throw new AppError('Skill is not associated with this creator profile', 404, 'CREATOR_SKILL_NOT_FOUND');
    }

    if (targetSkill.isPrimary && creator.creatorSkills.length > 1) {
      throw new AppError(
        'Cannot remove primary skill. Please designate another skill as primary before removing this one.',
        400,
        'CANNOT_DELETE_PRIMARY_SKILL'
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.creatorSkill.delete({
        where: { id: targetSkill.id },
      });

      // Recalculate completion score
      const remainingSkills = creator.creatorSkills.filter((s) => s.id !== targetSkill.id);
      const primary = remainingSkills.find((s) => s.isPrimary);
      const score = calculateCreatorProfileCompletion({
        stageName: creator.stageName,
        headline: creator.headline,
        bio: creator.bio,
        location: creator.location,
        primaryCategoryId: creator.primaryCategoryId,
        primarySkillId: primary?.skillId || null,
        hasAdditionalSkills: remainingSkills.some((s) => !s.isPrimary),
        experienceLevel: creator.experienceLevel,
        availability: creator.availability,
        roleAttributes: creator.roleAttributes as Record<string, unknown>,
      });

      await tx.creatorProfile.update({
        where: { id: creator.id },
        data: { profileCompletionScore: score },
      });

      return { deletedSkillId: skillId, newCompletionScore: score };
    });
  }

  /**
   * Returns completion checklist breakdown for the creator.
   */
  public static async getProfileCompletion(userId: string) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: { creatorSkills: true },
    });

    if (!creator) {
      throw new AppError('Creator profile not found', 404, 'CREATOR_PROFILE_NOT_FOUND');
    }

    const primarySkill = creator.creatorSkills.find((s) => s.isPrimary);
    return getCreatorProfileCompletionBreakdown({
      stageName: creator.stageName,
      headline: creator.headline,
      bio: creator.bio,
      location: creator.location,
      primaryCategoryId: creator.primaryCategoryId,
      primarySkillId: primarySkill?.skillId || null,
      hasAdditionalSkills: creator.creatorSkills.some((s) => !s.isPrimary),
      experienceLevel: creator.experienceLevel,
      availability: creator.availability,
      roleAttributes: creator.roleAttributes as Record<string, unknown>,
      coverImageUrl: creator.coverImageUrl,
      socialLinks: creator.socialLinks as Record<string, unknown>,
    });
  }
}
