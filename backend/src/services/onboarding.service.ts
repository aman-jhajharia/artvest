import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/apiResponse.js';
import { UserOnboardingInput, CreatorOnboardingInput } from '../validators/onboarding.validator.js';
import { calculateCreatorProfileCompletion } from '../utils/profileCompletion.js';

export class OnboardingService {
  /**
   * Completes onboarding for a standard community member (USER role).
   */
  public static async completeUserOnboarding(userId: string, input: UserOnboardingInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.isOnboarded) {
      throw new AppError('Account has already completed onboarding', 409, 'ALREADY_ONBOARDED');
    }

    // Check if username is already taken by another user
    const existingUsername = await prisma.userProfile.findUnique({
      where: { username: input.username },
    });

    if (existingUsername && existingUsername.userId !== userId) {
      throw new AppError(`Username '${input.username}' is already taken`, 409, 'USERNAME_TAKEN');
    }

    // Execute in transaction
    return prisma.$transaction(async (tx) => {
      const profile = await tx.userProfile.upsert({
        where: { userId },
        update: {
          username: input.username,
          bio: input.bio,
          location: input.location,
          interests: input.interests,
        },
        create: {
          userId,
          username: input.username,
          bio: input.bio,
          location: input.location,
          interests: input.interests,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          role: UserRole.USER, // Invariant: common member cannot be ADMIN
          isOnboarded: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          isOnboarded: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        user: updatedUser,
        profile,
      };
    });
  }

  /**
   * Completes onboarding for a creative professional (CREATOR role).
   */
  public static async completeCreatorOnboarding(userId: string, input: CreatorOnboardingInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.isOnboarded) {
      throw new AppError('Account has already completed onboarding', 409, 'ALREADY_ONBOARDED');
    }

    // Verify primary category exists
    const category = await prisma.category.findUnique({
      where: { id: input.primaryCategoryId },
    });

    if (!category) {
      throw new AppError('Selected primary category does not exist', 400, 'INVALID_CATEGORY');
    }

    // Verify primary skill exists and belongs to selected category
    const primarySkill = await prisma.skill.findUnique({
      where: { id: input.primarySkillId },
    });

    if (!primarySkill || primarySkill.categoryId !== category.id) {
      throw new AppError(
        'Selected primary skill does not exist or does not belong to the primary category',
        400,
        'INVALID_PRIMARY_SKILL'
      );
    }

    // Verify additional skills exist
    const additionalSkillIds = Array.from(new Set(input.additionalSkillIds)).filter(
      (id) => id !== input.primarySkillId
    );

    if (additionalSkillIds.length > 0) {
      const foundSkills = await prisma.skill.findMany({
        where: { id: { in: additionalSkillIds } },
      });

      if (foundSkills.length !== additionalSkillIds.length) {
        throw new AppError('One or more additional skills do not exist in the database', 400, 'INVALID_ADDITIONAL_SKILLS');
      }
    }

    // Calculate deterministic profile completion score
    const profileScore = calculateCreatorProfileCompletion({
      stageName: input.stageName,
      bio: input.bio,
      location: input.location,
      primaryCategoryId: input.primaryCategoryId,
      primarySkillId: input.primarySkillId,
      hasAdditionalSkills: additionalSkillIds.length > 0,
      experienceLevel: input.experienceLevel,
      availability: input.availability,
      roleAttributes: input.roleAttributes,
      socialLinks: input.socialLinks,
    });

    // Execute in transaction
    return prisma.$transaction(async (tx) => {
      // Create CreatorProfile
      const creatorProfile = await tx.creatorProfile.create({
        data: {
          userId,
          stageName: input.stageName,
          headline: input.headline,
          bio: input.bio,
          location: input.location,
          city: input.city,
          country: input.country,
          experienceLevel: input.experienceLevel,
          yearsExperience: input.yearsExperience,
          availability: input.availability,
          primaryCategoryId: input.primaryCategoryId,
          roleAttributes: input.roleAttributes as Prisma.InputJsonValue,
          collaborationPreferences: input.collaborationPreferences as Prisma.InputJsonValue,
          socialLinks: input.socialLinks as Prisma.InputJsonValue,
          profileCompletionScore: profileScore,
        },
      });

      // Insert primary skill
      await tx.creatorSkill.create({
        data: {
          creatorProfileId: creatorProfile.id,
          skillId: input.primarySkillId,
          isPrimary: true,
          yearsExperience: input.yearsExperience,
        },
      });

      // Insert additional skills
      for (const skillId of additionalSkillIds) {
        await tx.creatorSkill.create({
          data: {
            creatorProfileId: creatorProfile.id,
            skillId,
            isPrimary: false,
          },
        });
      }

      // Update User role to CREATOR and set isOnboarded = true
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: input.stageName || user.name,
          role: UserRole.CREATOR, // Assigned safely on server side
          isOnboarded: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          isOnboarded: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Retrieve full created creator profile with relations
      const fullCreatorProfile = await tx.creatorProfile.findUnique({
        where: { id: creatorProfile.id },
        include: {
          primaryCategory: true,
          creatorSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

      return {
        user: updatedUser,
        creatorProfile: fullCreatorProfile,
      };
    });
  }

  /**
   * Retrieves onboarding status of the authenticated user.
   */
  public static async getOnboardingStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isOnboarded: true,
        profile: { select: { id: true, username: true } },
        creatorProfile: { select: { id: true, stageName: true, profileCompletionScore: true } },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      isOnboarded: user.isOnboarded,
      role: user.role,
      hasProfile: Boolean(user.profile),
      hasCreatorProfile: Boolean(user.creatorProfile),
      creatorCompletionScore: user.creatorProfile?.profileCompletionScore || null,
    };
  }
}
