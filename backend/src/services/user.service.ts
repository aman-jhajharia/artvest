import { prisma } from '../config/database.js';
import { AppError } from '../utils/apiResponse.js';
import { UpdateUserProfileInput } from '../validators/user.validator.js';

export class UserService {
  /**
   * Retrieves user profile for the authenticated user.
   */
  public static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        isOnboarded: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Updates standard user profile (display name, username, bio, location, website, interests).
   */
  public static async updateUserProfile(userId: string, input: UpdateUserProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check unique username if username is changing
    if (input.username && user.profile && input.username !== user.profile.username) {
      const existingUsername = await prisma.userProfile.findUnique({
        where: { username: input.username },
      });
      if (existingUsername) {
        throw new AppError('Username is already taken by another account', 409, 'USERNAME_TAKEN');
      }
    }

    return prisma.$transaction(async (tx) => {
      // Update User.name if provided
      if (input.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: input.name },
        });
      }

      // Upsert UserProfile
      const updatedProfile = await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          username: input.username || `user_${userId.slice(-6)}`,
          bio: input.bio,
          location: input.location,
          website: input.website,
          interests: input.interests || [],
        },
        update: {
          username: input.username,
          bio: input.bio,
          location: input.location,
          website: input.website,
          interests: input.interests,
        },
      });

      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          isOnboarded: true,
          createdAt: true,
          profile: true,
        },
      });

      return updatedUser;
    });
  }
}
