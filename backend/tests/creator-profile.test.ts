import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { UserRole, ExperienceLevel, AvailabilityStatus } from '@prisma/client';
import { calculateCreatorProfileCompletion } from '../src/utils/profileCompletion.js';

const app = createApp();

describe('ArtVest Phase 2 - Creator Identity, Profiles & Skills Test Suite', () => {
  let creatorToken: string;
  let creatorCookie: string;
  let creatorUserId: string;
  let creatorProfileId: string;

  let otherCreatorToken: string;
  let otherCreatorUserId: string;

  let userToken: string;
  let userCookie: string;
  let regularUserId: string;

  let musicCategoryId: string;
  let singerSkillId: string;
  let composerSkillId: string;
  let photographerSkillId: string;

  before(async () => {
    // 1. Fetch seed taxonomy data
    const musicCat = await prisma.category.findUnique({ where: { slug: 'music' } });
    assert.ok(musicCat, 'Music category must exist');
    musicCategoryId = musicCat.id;

    const singer = await prisma.skill.findUnique({ where: { slug: 'singer' } });
    assert.ok(singer, 'Singer skill must exist');
    singerSkillId = singer.id;

    const composer = await prisma.skill.findUnique({ where: { slug: 'composer' } });
    assert.ok(composer, 'Composer skill must exist');
    composerSkillId = composer.id;

    const photographer = await prisma.skill.findUnique({ where: { slug: 'photographer' } });
    assert.ok(photographer, 'Photographer skill must exist');
    photographerSkillId = photographer.id;

    // 2. Create primary test creator user
    const creatorUser = await prisma.user.create({
      data: {
        email: `test.creator.${Date.now()}@example.com`,
        name: 'Aria Sharma',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    creatorUserId = creatorUser.id;

    const creatorProfile = await prisma.creatorProfile.create({
      data: {
        userId: creatorUserId,
        stageName: 'Aria Voice',
        headline: 'Classical & Fusion Vocalist',
        bio: 'Passionate singer exploring Indian classical and global ambient fusion.',
        location: 'Mumbai, India',
        city: 'Mumbai',
        country: 'India',
        experienceLevel: ExperienceLevel.ADVANCED,
        yearsExperience: 6,
        availability: AvailabilityStatus.AVAILABLE_FOR_COLLAB,
        primaryCategoryId: musicCategoryId,
        roleAttributes: {
          genres: ['Classical', 'Fusion'],
          languages: ['Hindi', 'English'],
          vocalType: 'Soprano',
        },
        profileCompletionScore: 65,
        isPublic: true,
      },
    });
    creatorProfileId = creatorProfile.id;

    // Add primary skill to creator
    await prisma.creatorSkill.create({
      data: {
        creatorProfileId: creatorProfile.id,
        skillId: singerSkillId,
        isPrimary: true,
        proficiency: 'EXPERT',
        yearsExperience: 6,
      },
    });

    creatorToken = AuthService.generateSessionToken({
      userId: creatorUser.id,
      email: creatorUser.email,
      role: creatorUser.role,
    });
    creatorCookie = `artvest_session=${creatorToken}`;

    // 3. Create second creator (to test unauthorized manipulation)
    const otherCreator = await prisma.user.create({
      data: {
        email: `test.other.creator.${Date.now()}@example.com`,
        name: 'Rohan Beats',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    otherCreatorUserId = otherCreator.id;
    await prisma.creatorProfile.create({
      data: {
        userId: otherCreatorUserId,
        stageName: 'Rohan Beats',
        headline: 'Music Producer & Arranger',
        bio: 'Producing electronic and indie music.',
        location: 'Bangalore, India',
        primaryCategoryId: musicCategoryId,
        profileCompletionScore: 50,
      },
    });
    otherCreatorToken = AuthService.generateSessionToken({
      userId: otherCreator.id,
      email: otherCreator.email,
      role: otherCreator.role,
    });

    // 4. Create standard non-creator user
    const standardUser = await prisma.user.create({
      data: {
        email: `test.regular.user.${Date.now()}@example.com`,
        name: 'Dev Fan',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });
    regularUserId = standardUser.id;
    await prisma.userProfile.create({
      data: {
        userId: standardUser.id,
        username: `dev_fan_${Date.now()}`,
        bio: 'Music enthusiast and patron of creative arts',
        location: 'Delhi',
        interests: ['Music', 'Film'],
      },
    });
    userToken = AuthService.generateSessionToken({
      userId: standardUser.id,
      email: standardUser.email,
      role: standardUser.role,
    });
    userCookie = `artvest_session=${userToken}`;
  });

  after(async () => {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: {
        id: { in: [creatorUserId, otherCreatorUserId, regularUserId] },
      },
    });
  });

  // 1. Creator can retrieve profile
  it('1. Authenticated creator can retrieve their full profile with completion breakdown', async () => {
    const res = await request(app)
      .get('/api/creator/profile')
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.userId, creatorUserId);
    assert.equal(res.body.data.stageName, 'Aria Voice');
    assert.equal(res.body.data.primaryCategory.slug, 'music');
    assert.ok(Array.isArray(res.body.data.creatorSkills));
    assert.equal(res.body.data.creatorSkills.length, 1);
    assert.equal(res.body.data.creatorSkills[0].isPrimary, true);
    assert.ok(res.body.data.completionBreakdown);
    assert.ok(typeof res.body.data.completionBreakdown.score === 'number');
    assert.ok(Array.isArray(res.body.data.completionBreakdown.checklist));
  });

  // 2. Creator can update profile
  it('2. Authenticated creator can update their profile partially', async () => {
    const res = await request(app)
      .patch('/api/creator/profile')
      .set('Cookie', [creatorCookie])
      .send({
        headline: 'Lead Soprano & Indie Fusion Artist',
        bio: 'Vocalist and performer blending ancient classical ragas with modern synthesizers.',
        yearsExperience: 7,
        availability: 'OPEN_TO_WORK',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.headline, 'Lead Soprano & Indie Fusion Artist');
    assert.equal(res.body.data.yearsExperience, 7);
    assert.equal(res.body.data.availability, 'OPEN_TO_WORK');
  });

  // 3. Invalid profile data is rejected
  it('3. Rejects invalid profile update data with 400 and validation errors', async () => {
    const res = await request(app)
      .patch('/api/creator/profile')
      .set('Cookie', [creatorCookie])
      .send({
        bio: 'Too short', // Min length is 10
        yearsExperience: -5, // Must be >= 0
        availability: 'NOT_A_VALID_STATUS',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details);
  });

  // 4. User cannot update or access creator profile
  it('4. Non-creator USER receives 403 Forbidden when attempting to access /api/creator/profile', async () => {
    const getRes = await request(app)
      .get('/api/creator/profile')
      .set('Cookie', [userCookie]);

    assert.equal(getRes.status, 403);
    assert.equal(getRes.body.success, false);
    assert.equal(getRes.body.error.code, 'FORBIDDEN');

    const patchRes = await request(app)
      .patch('/api/creator/profile')
      .set('Cookie', [userCookie])
      .send({ headline: 'Hacking headline' });

    assert.equal(patchRes.status, 403);
    assert.equal(patchRes.body.success, false);
    assert.equal(patchRes.body.error.code, 'FORBIDDEN');
  });

  // 5. Creator can add a valid skill
  it('5. Creator can add a valid skill to their profile', async () => {
    const res = await request(app)
      .post('/api/creator/skills')
      .set('Cookie', [creatorCookie])
      .send({
        skillId: composerSkillId,
        isPrimary: false,
        proficiency: 'INTERMEDIATE',
        yearsExperience: 3,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.skillId, composerSkillId);
    assert.equal(res.body.data.isPrimary, false);
    assert.equal(res.body.data.proficiency, 'INTERMEDIATE');
  });

  // 6. Duplicate skill is rejected
  it('6. Duplicate skill relationship is rejected with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/creator/skills')
      .set('Cookie', [creatorCookie])
      .send({
        skillId: composerSkillId, // Already added in test 5
        isPrimary: false,
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'DUPLICATE_CREATOR_SKILL');
  });

  // 7. Creator can remove a secondary skill
  it('7. Creator can remove a secondary skill from their profile', async () => {
    const res = await request(app)
      .delete(`/api/creator/skills/${composerSkillId}`)
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.deletedSkillId, composerSkillId);

    // Verify it is no longer in skills list
    const listRes = await request(app)
      .get('/api/creator/skills')
      .set('Cookie', [creatorCookie]);

    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.data.length, 1);
    assert.equal(listRes.body.data[0].skillId, singerSkillId);
  });

  // 8. Invalid skill ID is rejected
  it('8. Rejects adding a non-existent skill ID with 404', async () => {
    const res = await request(app)
      .post('/api/creator/skills')
      .set('Cookie', [creatorCookie])
      .send({
        skillId: 'non_existent_cuid_1234567890',
        isPrimary: false,
      });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'SKILL_NOT_FOUND');
  });

  // 9. Creator cannot manipulate another creator's profile
  it("9. Creator cannot manipulate another creator's profile (session scoping enforced)", async () => {
    // Calling PATCH from otherCreator modifies otherCreator's profile, NOT the first creator
    const res = await request(app)
      .patch('/api/creator/profile')
      .set('Authorization', `Bearer ${otherCreatorToken}`)
      .send({ headline: 'Other Creator Independent Headline' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.userId, otherCreatorUserId);
    assert.equal(res.body.data.headline, 'Other Creator Independent Headline');

    // First creator's profile remains untouched
    const checkFirst = await prisma.creatorProfile.findUnique({
      where: { userId: creatorUserId },
    });
    assert.equal(checkFirst?.headline, 'Lead Soprano & Indie Fusion Artist');
  });

  // 10. RoleAttributes validation works
  it('10. Validates role-specific attributes by discipline and rejects arbitrary metadata', async () => {
    // Valid role attributes for Singer
    const validRes = await request(app)
      .patch('/api/creator/profile')
      .set('Cookie', [creatorCookie])
      .send({
        roleAttributes: {
          genres: ['Carnatic', 'Devotional', 'World'],
          languages: ['Tamil', 'Sanskrit', 'Hindi'],
          vocalType: 'Mezzo-Soprano',
        },
      });

    assert.equal(validRes.status, 200);
    assert.equal(validRes.body.success, true);
    assert.deepEqual(validRes.body.data.roleAttributes.genres, ['Carnatic', 'Devotional', 'World']);

    // Incompatible/missing required fields for Singer (missing genres and languages)
    const invalidRes = await request(app)
      .patch('/api/creator/profile')
      .set('Cookie', [creatorCookie])
      .send({
        roleAttributes: {
          randomKey: 12345, // Missing required singer genres
        },
      });

    assert.equal(invalidRes.status, 400);
    assert.equal(invalidRes.body.success, false);
    assert.equal(invalidRes.body.error.code, 'INVALID_ROLE_ATTRIBUTES');
  });

  // 11. Profile completion score is deterministic
  it('11. Profile completion calculation is strictly deterministic and bounded (0-100)', () => {
    const input = {
      stageName: 'Aria Voice',
      bio: 'Classical and fusion artist.',
      location: 'Mumbai',
      primaryCategoryId: 'cat_music',
      primarySkillId: 'skill_singer',
      hasAdditionalSkills: true,
      experienceLevel: ExperienceLevel.ADVANCED,
      availability: AvailabilityStatus.AVAILABLE_FOR_COLLAB,
      roleAttributes: { genres: ['Fusion'] },
      coverImageUrl: 'https://example.com/cover.jpg',
      socialLinks: { spotify: 'https://spotify.com/aria' },
    };

    const score1 = calculateCreatorProfileCompletion(input);
    const score2 = calculateCreatorProfileCompletion(input);

    assert.equal(score1, score2, 'Repeated runs must yield identical scores');
    assert.ok(score1 >= 0 && score1 <= 100, 'Score must be between 0 and 100');
  });

  // 12. Profile completion changes when required fields change
  it('12. Profile completion score updates dynamically as profile items are completed', async () => {
    const compBefore = await request(app)
      .get('/api/creator/profile/completion')
      .set('Cookie', [creatorCookie]);

    const initialScore = compBefore.body.data.score;

    // Adding coverImageUrl and website should increase score
    const updateRes = await request(app)
      .patch('/api/creator/profile')
      .set('Cookie', [creatorCookie])
      .send({
        coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        website: 'https://ariavoice.art',
        socialLinks: { spotify: 'https://open.spotify.com/artist/aria' },
      });

    assert.equal(updateRes.status, 200);
    assert.ok(
      updateRes.body.data.profileCompletionScore > initialScore,
      `Updated score (${updateRes.body.data.profileCompletionScore}) should be greater than initial (${initialScore})`
    );
  });

  // 13. Public creator profile endpoint returns correct data and respect privacy
  it('13. Public endpoint GET /api/creators/:creatorId returns creator data and respects isPublic flag', async () => {
    const publicRes = await request(app).get(`/api/creators/${creatorUserId}`);

    assert.equal(publicRes.status, 200);
    assert.equal(publicRes.body.success, true);
    assert.equal(publicRes.body.data.stageName, 'Aria Voice');
    assert.ok(publicRes.body.data.primaryCategory);
    assert.ok(Array.isArray(publicRes.body.data.creatorSkills));

    // Make profile private
    await prisma.creatorProfile.update({
      where: { userId: creatorUserId },
      data: { isPublic: false },
    });

    // Unauthenticated request receives 403
    const privateRes = await request(app).get(`/api/creators/${creatorUserId}`);
    assert.equal(privateRes.status, 403);
    assert.equal(privateRes.body.error.code, 'PROFILE_PRIVATE');

    // Restore public visibility
    await prisma.creatorProfile.update({
      where: { userId: creatorUserId },
      data: { isPublic: true },
    });
  });

  // 14. User profile remains separate from creator profile
  it('14. Standard USER profile endpoints operate cleanly and remain isolated from creator APIs', async () => {
    // User can get their own user profile
    const userRes = await request(app)
      .get('/api/user/profile')
      .set('Cookie', [userCookie]);

    assert.equal(userRes.status, 200);
    assert.equal(userRes.body.success, true);
    assert.equal(userRes.body.data.id, regularUserId);
    assert.ok(userRes.body.data.profile);

    // User can update their own user profile
    const updateRes = await request(app)
      .patch('/api/user/profile')
      .set('Cookie', [userCookie])
      .send({
        name: 'Dev Anand',
        bio: 'Updated bio for creative patron',
        interests: ['Music', 'Film', 'Photography'],
      });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.name, 'Dev Anand');
    assert.equal(updateRes.body.data.profile.bio, 'Updated bio for creative patron');
    assert.equal(updateRes.body.data.profile.interests.length, 3);
  });
});
