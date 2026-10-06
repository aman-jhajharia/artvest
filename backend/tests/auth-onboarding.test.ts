import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
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
});
