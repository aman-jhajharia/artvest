import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { getSessionCookieOptions, getClearSessionCookieOptions } from '../src/config/index.js';
import { UserRole } from '@prisma/client';

const app = createApp();

describe('ArtVest Phase 1 - Authentication & Onboarding Test Suite', () => {
  let userSessionCookie: string;
  let testUserEmail: string;
  let testUserId: string;
  let primaryCategoryId: string;
  let primarySkillId: string;
  let additionalSkillId: string;

  before(async () => {
    // Retrieve seeded taxonomy data for tests
    const category = await prisma.category.findUnique({ where: { slug: 'music' } });
    assert.ok(category, 'Seed category "music" must exist');
    primaryCategoryId = category.id;

    const singerSkill = await prisma.skill.findUnique({ where: { slug: 'singer' } });
    assert.ok(singerSkill, 'Seed skill "singer" must exist');
    primarySkillId = singerSkill.id;

    const composerSkill = await prisma.skill.findUnique({ where: { slug: 'composer' } });
    assert.ok(composerSkill, 'Seed skill "composer" must exist');
    additionalSkillId = composerSkill.id;
  });

  after(async () => {
    // Cleanup test users created during tests
    if (testUserEmail) {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test.auth' } },
      });
    }
  });

  // 1. Taxonomy Tests
  it('GET /api/categories returns seeded categories', async () => {
    const res = await request(app).get('/api/categories');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 6);
  });

  it('GET /api/skills returns skills filtered by category', async () => {
    const res = await request(app).get(`/api/skills?categoryId=${primaryCategoryId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.every((s: { categoryId: string }) => s.categoryId === primaryCategoryId));
  });

  // 2. Authentication Tests
  it('Rejects unauthenticated request on protected route GET /api/auth/me with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  it('Rejects request with invalid or corrupted session cookie with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', ['artvest_session=invalid.bogus.jwt.token']);
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  it('POST /api/auth/google registers new user and sets HttpOnly cookie', async () => {
    testUserEmail = `test.auth.${Date.now()}@example.com`;
    const mockCredential = `mock_test_credential:${JSON.stringify({
      googleId: `google_sub_${Date.now()}`,
      email: testUserEmail,
      name: 'Pooja Sharma',
      avatarUrl: 'https://lh3.googleusercontent.com/test-avatar.jpg',
    })}`;

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: mockCredential });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUserEmail);
    assert.equal(res.body.data.user.role, 'USER');
    assert.equal(res.body.data.user.isOnboarded, false);

    // Verify HttpOnly cookie in response
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Response must contain set-cookie header');
    const sessionCookie = (cookies as unknown as string[]).find((c: string) => c.startsWith('artvest_session='));
    assert.ok(sessionCookie, 'Must set artvest_session cookie');
    assert.ok(sessionCookie.includes('HttpOnly'), 'Cookie must be HttpOnly');

    userSessionCookie = sessionCookie.split(';')[0];
    testUserId = res.body.data.user.id;
  });

  it('Duplicate Google user login does not create duplicate account', async () => {
    const mockCredential = `mock_test_credential:${JSON.stringify({
      googleId: `google_sub_existing`,
      email: testUserEmail,
      name: 'Pooja Sharma Updated',
    })}`;

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: mockCredential });

    assert.equal(res.status, 200); // 200 OK for returning user vs 201 for new
    assert.equal(res.body.data.user.id, testUserId);
    assert.equal(res.body.data.isNewUser, false);

    // Verify DB user count for this email is exactly 1
    const count = await prisma.user.count({ where: { email: testUserEmail } });
    assert.equal(count, 1);
  });

  it('GET /api/auth/me returns current user profile when valid session cookie provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [userSessionCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, testUserEmail);
    assert.equal(res.body.data.isOnboarded, false);
  });

  it('POST /api/auth/logout clears session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.equal(res.status, 200);
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const clearedCookie = (cookies as unknown as string[]).find((c: string) => c.startsWith('artvest_session='));
    assert.ok(clearedCookie);
    assert.ok(clearedCookie.includes('Expires=') || clearedCookie.includes('Max-Age=0'));
  });

  // 3. User Onboarding Tests
  it('Rejects invalid user onboarding data with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/onboarding/user')
      .set('Cookie', [userSessionCookie])
      .send({
        name: 'A', // too short (< 2)
        username: 'invalid user space!', // invalid chars
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('Completes user onboarding successfully and updates isOnboarded = true', async () => {
    const res = await request(app)
      .post('/api/onboarding/user')
      .set('Cookie', [userSessionCookie])
      .send({
        name: 'Pooja Sharma',
        username: `pooja_${Date.now()}`,
        bio: 'Art enthusiast and classical music listener.',
        location: 'Jaipur, Rajasthan',
        interests: ['music', 'dance'],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.isOnboarded, true);
    assert.equal(res.body.data.user.role, 'USER');
    assert.ok(res.body.data.profile);
  });

  it('Rejects submitting onboarding a second time with 409 conflict', async () => {
    const res = await request(app)
      .post('/api/onboarding/user')
      .set('Cookie', [userSessionCookie])
      .send({
        name: 'Pooja Sharma Again',
        username: `pooja_again_${Date.now()}`,
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'ALREADY_ONBOARDED');
  });

  // 4. Creator Onboarding Tests (with another test user)
  it('Completes creator onboarding with validated role attributes and deterministic score', async () => {
    const creatorEmail = `test.auth.creator.${Date.now()}@example.com`;
    const mockCreatorCredential = `mock_test_credential:${JSON.stringify({
      googleId: `google_creator_${Date.now()}`,
      email: creatorEmail,
      name: 'Aarav Khan',
    })}`;

    const authRes = await request(app)
      .post('/api/auth/google')
      .send({ credential: mockCreatorCredential });

    const cookie = authRes.headers['set-cookie'][0].split(';')[0];

    const onboardingRes = await request(app)
      .post('/api/onboarding/creator')
      .set('Cookie', [cookie])
      .send({
        stageName: 'Aarav Sangeet',
        headline: 'Classical Vocalist & Fusion Composer',
        bio: 'Hindustani vocalist trained in Kirana Gharana. Seeking collaborators for indie film scores.',
        location: 'Jaipur, Rajasthan',
        city: 'Jaipur',
        experienceLevel: 'PROFESSIONAL',
        yearsExperience: 6,
        availability: 'AVAILABLE_FOR_COLLAB',
        primaryCategoryId: primaryCategoryId,
        primarySkillId: primarySkillId,
        additionalSkillIds: [additionalSkillId, primarySkillId], // intentional duplicate primary skill in array
        roleAttributes: {
          genres: ['Classical', 'Thumri', 'Fusion'],
          languages: ['Hindi', 'Sanskrit'],
          vocalType: 'Tenor',
        },
      });

    assert.equal(onboardingRes.status, 200);
    assert.equal(onboardingRes.body.success, true);
    assert.equal(onboardingRes.body.data.user.role, 'CREATOR');
    assert.equal(onboardingRes.body.data.user.isOnboarded, true);

    const cp = onboardingRes.body.data.creatorProfile;
    assert.ok(cp);
    assert.equal(cp.stageName, 'Aarav Sangeet');
    assert.ok(cp.profileCompletionScore > 50, 'Deterministic score must be calculated');

    // Verify duplicate skill was prevented
    const skills = cp.creatorSkills;
    assert.equal(skills.length, 2, 'Must have primary skill + additional skill without duplicates');
    const primarySkills = skills.filter((s: { isPrimary: boolean }) => s.isPrimary);
    assert.equal(primarySkills.length, 1, 'Exactly one primary skill');
  });

  // 5. Role Authorization Invariant Test
  it('Ensures role cannot be hijacked to ADMIN during onboarding', async () => {
    const hackerEmail = `test.auth.hacker.${Date.now()}@example.com`;
    const mockHackerCredential = `mock_test_credential:${JSON.stringify({
      googleId: `google_hacker_${Date.now()}`,
      email: hackerEmail,
      name: 'Sneaky User',
    })}`;

    const authRes = await request(app)
      .post('/api/auth/google')
      .send({ credential: mockHackerCredential });

    const cookie = authRes.headers['set-cookie'][0].split(';')[0];

    // Try sending role: ADMIN in body
    await request(app)
      .post('/api/onboarding/user')
      .set('Cookie', [cookie])
      .send({
        name: 'Sneaky User',
        username: `sneaky_${Date.now()}`,
        role: 'ADMIN', // Sneaky attempt
      });

    // Verify in database that user role is strictly USER
    const dbUser = await prisma.user.findUnique({ where: { email: hackerEmail } });
    assert.equal(dbUser?.role, UserRole.USER, 'User role MUST remain USER');
  });

  // 6. Cookie Policy Configuration Tests
  describe('Cookie Policy Security Invariants', () => {
    it('Production session cookie uses sameSite=none and secure=true for cross-site Render <-> Vercel auth', () => {
      const prodOpts = getSessionCookieOptions('production');
      assert.equal(prodOpts.httpOnly, true, 'Production cookie MUST be HttpOnly');
      assert.equal(prodOpts.secure, true, 'Production cookie MUST be Secure (required for sameSite=none)');
      assert.equal(prodOpts.sameSite, 'none', 'Production cookie MUST be sameSite=none for cross-origin SPA');
      assert.equal(prodOpts.path, '/', 'Production cookie MUST be scoped to root path /');
      assert.equal(prodOpts.maxAge, 7 * 24 * 60 * 60 * 1000);
    });

    it('Production clear session cookie matches sameSite=none and secure=true to ensure browser clears it', () => {
      const prodClearOpts = getClearSessionCookieOptions('production');
      assert.equal(prodClearOpts.httpOnly, true);
      assert.equal(prodClearOpts.secure, true);
      assert.equal(prodClearOpts.sameSite, 'none');
      assert.equal(prodClearOpts.path, '/');
    });

    it('Development session cookie uses sameSite=lax and secure=false for localhost testing without HTTPS', () => {
      const devOpts = getSessionCookieOptions('development');
      assert.equal(devOpts.httpOnly, true);
      assert.equal(devOpts.secure, false, 'Dev cookie MUST NOT require HTTPS');
      assert.equal(devOpts.sameSite, 'lax');
      assert.equal(devOpts.path, '/');
    });

    it('Development clear session cookie matches sameSite=lax and secure=false', () => {
      const devClearOpts = getClearSessionCookieOptions('development');
      assert.equal(devClearOpts.httpOnly, true);
      assert.equal(devClearOpts.secure, false);
      assert.equal(devClearOpts.sameSite, 'lax');
      assert.equal(devClearOpts.path, '/');
    });
  });

  // 7. Creator Onboarding Security & Validation Tests
  describe('Creator Onboarding Security & Validation', () => {
    it('Rejects unauthenticated POST /api/onboarding/creator with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/onboarding/creator')
        .send({
          headline: 'Cinematographer & Lighting Director',
          bio: 'Visual artist and director of photography working with anamorphic lenses.',
          location: 'Mumbai, Maharashtra',
          experienceLevel: 'ADVANCED',
          primaryCategoryId,
          primarySkillId,
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });

    it('Rejects creator onboarding with invalid bio (< 10 chars) with 400 VALIDATION_ERROR', async () => {
      const testEmail = `test.auth.val.${Date.now()}@example.com`;
      const authRes = await request(app)
        .post('/api/auth/google')
        .send({
          credential: `mock_test_credential:${JSON.stringify({
            googleId: `google_val_${Date.now()}`,
            email: testEmail,
            name: 'Val User',
          })}`,
        });

      const cookie = authRes.headers['set-cookie'][0].split(';')[0];

      const res = await request(app)
        .post('/api/onboarding/creator')
        .set('Cookie', [cookie])
        .send({
          headline: 'Cinematographer',
          bio: 'Too short', // < 10 characters
          location: 'Mumbai',
          experienceLevel: 'INTERMEDIATE',
          primaryCategoryId,
          primarySkillId,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  // 8. Universal & Category-Aware Creative Metadata Tests
  describe('Category-Aware Creative Metadata Across Disciplines', () => {
    it('Completes creator onboarding for Film & Acting with universal cinematic metadata', async () => {
      // Find film & acting category and cinematographer/filmmaker skill
      const filmCategory = await prisma.category.findUnique({ where: { slug: 'film-acting' } });
      assert.ok(filmCategory, 'Film category must exist');

      const skills = await prisma.skill.findMany({ where: { categoryId: filmCategory.id } });
      assert.ok(skills.length > 0, 'Film skills must exist');
      const filmSkillId = skills[0].id;

      const filmmakerEmail = `test.auth.film.${Date.now()}@example.com`;
      const authRes = await request(app)
        .post('/api/auth/google')
        .send({
          credential: `mock_test_credential:${JSON.stringify({
            googleId: `google_film_${Date.now()}`,
            email: filmmakerEmail,
            name: 'Vikram Sethi',
          })}`,
        });

      const cookie = authRes.headers['set-cookie'][0].split(';')[0];

      const res = await request(app)
        .post('/api/onboarding/creator')
        .set('Cookie', [cookie])
        .send({
          stageName: 'Vikram Sethi DOP',
          headline: 'Cinematographer & Narrative Director of Photography',
          bio: 'Specializing in independent cinema, moody anamorphic lighting, and high dynamic range color grading.',
          location: 'Mumbai, Maharashtra',
          city: 'Mumbai',
          experienceLevel: 'ADVANCED',
          yearsExperience: 8,
          availability: 'OPEN_TO_WORK',
          primaryCategoryId: filmCategory.id,
          primarySkillId: filmSkillId,
          roleAttributes: {
            specializations: ['Narrative Fiction', 'Indie Feature', 'Documentary'],
            genres: ['Narrative Fiction', 'Indie Feature', 'Documentary'],
            practiceContext: ['Independent Film Set', 'Festival Circuit'],
            tools: ['ARRI Alexa Mini', 'Cooke Anamorphic', 'DaVinci Resolve'],
            equipment: ['ARRI Alexa Mini', 'Cooke Anamorphic', 'DaVinci Resolve'],
            techniques: ['Anamorphic Framing', 'Low-Key Lighting'],
            languages: ['Hindi', 'English'],
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.role, 'CREATOR');

      const cp = res.body.data.creatorProfile;
      assert.ok(cp);
      assert.equal(cp.stageName, 'Vikram Sethi DOP');

      const roleAttrs = cp.roleAttributes as Record<string, unknown>;
      assert.ok(Array.isArray(roleAttrs.specializations));
      assert.deepEqual(roleAttrs.specializations, ['Narrative Fiction', 'Indie Feature', 'Documentary']);
      assert.deepEqual(roleAttrs.tools, ['ARRI Alexa Mini', 'Cooke Anamorphic', 'DaVinci Resolve']);
      assert.deepEqual(roleAttrs.practiceContext, ['Independent Film Set', 'Festival Circuit']);
      assert.deepEqual(roleAttrs.techniques, ['Anamorphic Framing', 'Low-Key Lighting']);
      // Notice: No vocalType forced onto a cinematographer!
      assert.equal(roleAttrs.vocalType, undefined);
    });

    it('Completes creator onboarding for Dance with movement & choreography metadata', async () => {
      const danceCategory = await prisma.category.findUnique({ where: { slug: 'dance' } });
      assert.ok(danceCategory, 'Dance category must exist');

      const danceSkills = await prisma.skill.findMany({ where: { categoryId: danceCategory.id } });
      assert.ok(danceSkills.length > 0, 'Dance skills must exist');
      const danceSkillId = danceSkills[0].id;

      const dancerEmail = `test.auth.dance.${Date.now()}@example.com`;
      const authRes = await request(app)
        .post('/api/auth/google')
        .send({
          credential: `mock_test_credential:${JSON.stringify({
            googleId: `google_dance_${Date.now()}`,
            email: dancerEmail,
            name: 'Ananya Roy',
          })}`,
        });

      const cookie = authRes.headers['set-cookie'][0].split(';')[0];

      const res = await request(app)
        .post('/api/onboarding/creator')
        .set('Cookie', [cookie])
        .send({
          stageName: 'Ananya Movement',
          headline: 'Contemporary Dancer & Movement Director',
          bio: 'Exploring traditional somatic lineages merged with contemporary contact improvisation.',
          location: 'Bangalore, Karnataka',
          city: 'Bangalore',
          experienceLevel: 'PROFESSIONAL',
          yearsExperience: 5,
          availability: 'AVAILABLE_FOR_COLLAB',
          primaryCategoryId: danceCategory.id,
          primarySkillId: danceSkillId,
          roleAttributes: {
            specializations: ['Contemporary', 'Contact Improvisation', 'Kathak'],
            practiceContext: ['Theatre Stage', 'Dance Film', 'Site-Specific'],
            tools: ['Kalaripayattu Grounding', 'Floorwork Release'],
            choreographyRoles: ['Movement Director', 'Choreographer'],
            languages: ['Bengali', 'Hindi', 'English'],
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.role, 'CREATOR');

      const cp = res.body.data.creatorProfile;
      assert.ok(cp);
      const roleAttrs = cp.roleAttributes as Record<string, unknown>;
      assert.deepEqual(roleAttrs.specializations, ['Contemporary', 'Contact Improvisation', 'Kathak']);
      assert.deepEqual(roleAttrs.choreographyRoles, ['Movement Director', 'Choreographer']);
    });

    it('Verifies existing seeded creator data remains valid without migrations', async () => {
      const seededCreators = await prisma.creatorProfile.findMany({
        take: 3,
        include: { user: true, primaryCategory: true },
      });

      assert.ok(seededCreators.length > 0, 'Seeded creators must exist in the database');
      for (const creator of seededCreators) {
        assert.ok(creator.id, 'Creator must have valid ID');
        assert.ok(creator.userId, 'Creator must link to user');
        assert.ok(creator.primaryCategoryId, 'Creator must have primary category');
        // Seeded roleAttributes (JSON) remains accessible
        assert.ok(typeof creator.roleAttributes === 'object');
      }
    });
  });
});
