import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import {
  UserRole,
  ExperienceLevel,
  AvailabilityStatus,
  PostType,
  PostStatus,
} from '@prisma/client';

const app = createApp();

describe('ArtVest Phase 5 - Explore & Structured Discovery Test Suite', () => {
  let viewerToken: string;
  let viewerCookie: string;
  let viewerUserId: string;

  // Categories
  let musicCatId: string;
  let filmCatId: string;

  // Skills
  let singerSkillId: string;
  let cinematographerSkillId: string;
  let editorSkillId: string;

  // Test Creators
  let jaipurSingerUserId: string;
  let jaipurSingerProfileId: string;

  let mumbaiCameramanUserId: string;
  let mumbaiCameramanProfileId: string;

  let privateCreatorUserId: string;
  let privateCreatorProfileId: string;

  // Test Posts
  let publishedShowcasePostId: string;
  let draftPostId: string;

  before(async () => {
    // 1. Create or fetch Categories
    const musicCat = await prisma.category.upsert({
      where: { slug: 'music-explore-test' },
      update: {},
      create: {
        name: 'Music Explore Test',
        slug: 'music-explore-test',
        themeKey: 'music',
      },
    });
    musicCatId = musicCat.id;

    const filmCat = await prisma.category.upsert({
      where: { slug: 'film-explore-test' },
      update: {},
      create: {
        name: 'Film Explore Test',
        slug: 'film-explore-test',
        themeKey: 'film',
      },
    });
    filmCatId = filmCat.id;

    // 2. Create or fetch Skills
    const singerSkill = await prisma.skill.upsert({
      where: { slug: 'singer-explore-test' },
      update: {},
      create: {
        name: 'Classical Singer',
        slug: 'singer-explore-test',
        categoryId: musicCatId,
      },
    });
    singerSkillId = singerSkill.id;

    const cinematographerSkill = await prisma.skill.upsert({
      where: { slug: 'cinematographer-explore-test' },
      update: {},
      create: {
        name: 'Cinematographer',
        slug: 'cinematographer-explore-test',
        categoryId: filmCatId,
      },
    });
    cinematographerSkillId = cinematographerSkill.id;

    const editorSkill = await prisma.skill.upsert({
      where: { slug: 'editor-explore-test' },
      update: {},
      create: {
        name: 'Film Editor',
        slug: 'editor-explore-test',
        categoryId: filmCatId,
      },
    });
    editorSkillId = editorSkill.id;

    // 3. Create Viewer User
    const viewer = await prisma.user.create({
      data: {
        email: `p5.viewer.${Date.now()}@example.com`,
        name: 'Discovery Viewer',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });
    viewerUserId = viewer.id;
    viewerToken = AuthService.generateSessionToken({
      userId: viewer.id,
      email: viewer.email,
      role: viewer.role,
    });
    viewerCookie = `artvest_session=${viewerToken}`;

    // 4. Creator A: Classical Singer in Jaipur (Professional, Available)
    const singerUser = await prisma.user.create({
      data: {
        email: `p5.singer.${Date.now()}@example.com`,
        name: 'Aanya Sharma',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    jaipurSingerUserId = singerUser.id;

    const singerProfile = await prisma.creatorProfile.create({
      data: {
        userId: jaipurSingerUserId,
        stageName: 'Aanya Swara',
        headline: 'Hindustani Classical Vocalist and Harmonium Artist',
        bio: 'Trained vocalist specializing in classical fusion and ghazals.',
        location: 'Jaipur, Rajasthan',
        city: 'Jaipur',
        country: 'India',
        experienceLevel: ExperienceLevel.PROFESSIONAL,
        yearsExperience: 8,
        availability: AvailabilityStatus.AVAILABLE_FOR_COLLAB,
        primaryCategoryId: musicCatId,
        profileCompletionScore: 90,
        isVerified: true,
        isPublic: true,
      },
    });
    jaipurSingerProfileId = singerProfile.id;

    await prisma.creatorSkill.create({
      data: {
        creatorProfileId: jaipurSingerProfileId,
        skillId: singerSkillId,
        isPrimary: true,
        proficiency: 'EXPERT',
        yearsExperience: 8,
      },
    });

    // 5. Creator B: Cinematographer in Mumbai (Advanced, Open to work)
    const cameramanUser = await prisma.user.create({
      data: {
        email: `p5.camera.${Date.now()}@example.com`,
        name: 'Kabir Verma',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    mumbaiCameramanUserId = cameramanUser.id;

    const cameramanProfile = await prisma.creatorProfile.create({
      data: {
        userId: mumbaiCameramanUserId,
        stageName: 'Kabir V.',
        headline: 'Documentary and Narrative Cinematographer',
        bio: 'Specializing in handheld camera work and 16mm analog emulation.',
        location: 'Mumbai, Maharashtra',
        city: 'Mumbai',
        country: 'India',
        experienceLevel: ExperienceLevel.ADVANCED,
        yearsExperience: 5,
        availability: AvailabilityStatus.OPEN_TO_WORK,
        primaryCategoryId: filmCatId,
        profileCompletionScore: 80,
        isVerified: false,
        isPublic: true,
      },
    });
    mumbaiCameramanProfileId = cameramanProfile.id;

    await prisma.creatorSkill.createMany({
      data: [
        {
          creatorProfileId: mumbaiCameramanProfileId,
          skillId: cinematographerSkillId,
          isPrimary: true,
          proficiency: 'ADVANCED',
          yearsExperience: 5,
        },
        {
          creatorProfileId: mumbaiCameramanProfileId,
          skillId: editorSkillId,
          isPrimary: false,
          proficiency: 'INTERMEDIATE',
          yearsExperience: 3,
        },
      ],
    });

    // 6. Creator C: Private Creator (isPublic: false) - MUST BE EXCLUDED FROM DISCOVERY
    const privateUser = await prisma.user.create({
      data: {
        email: `p5.private.${Date.now()}@example.com`,
        name: 'Secret Artist',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    privateCreatorUserId = privateUser.id;

    const privateProfile = await prisma.creatorProfile.create({
      data: {
        userId: privateCreatorUserId,
        stageName: 'Ghost Creator',
        headline: 'Stealth Indie Musician',
        location: 'Jaipur, Rajasthan',
        city: 'Jaipur',
        experienceLevel: ExperienceLevel.PROFESSIONAL,
        availability: AvailabilityStatus.AVAILABLE_FOR_COLLAB,
        primaryCategoryId: musicCatId,
        profileCompletionScore: 70,
        isPublic: false, // PRIVATE
      },
    });
    privateCreatorProfileId = privateProfile.id;

    // 7. Viewer follows Creator A (Jaipur Singer)
    await prisma.follow.create({
      data: {
        followerId: viewerUserId,
        followingId: jaipurSingerUserId,
      },
    });

    // 8. Create published post for Creator A
    const publishedPost = await prisma.post.create({
      data: {
        authorId: jaipurSingerUserId,
        creatorProfileId: jaipurSingerProfileId,
        title: 'Morning Raag Bhairav Showcase',
        caption: 'Classical vocal performance in Jaipur courtyard',
        description: 'Improvised classical alaap in morning raag with harmonium accompaniment',
        postType: PostType.AUDIO,
        status: PostStatus.PUBLISHED,
        categoryId: musicCatId,
        tags: ['classical', 'vocal', 'fusion', 'jaipur'],
        publishedAt: new Date(),
        skills: {
          connect: [{ id: singerSkillId }],
        },
      },
    });
    publishedShowcasePostId = publishedPost.id;

    // 9. Create draft post for Creator A (MUST BE EXCLUDED FROM POST EXPLORE)
    const draftPost = await prisma.post.create({
      data: {
        authorId: jaipurSingerUserId,
        creatorProfileId: jaipurSingerProfileId,
        title: 'Work In Progress Alaap',
        caption: 'Unfinished draft not for public discovery',
        postType: PostType.AUDIO,
        status: PostStatus.DRAFT,
        categoryId: musicCatId,
      },
    });
    draftPostId = draftPost.id;
  });

  after(async () => {
    // Cleanup fixtures
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: viewerUserId },
          { followingId: jaipurSingerUserId },
          { followingId: mumbaiCameramanUserId },
        ],
      },
    });
    await prisma.post.deleteMany({
      where: {
        authorId: {
          in: [jaipurSingerUserId, mumbaiCameramanUserId, privateCreatorUserId, viewerUserId],
        },
      },
    });
    await prisma.creatorSkill.deleteMany({
      where: {
        creatorProfileId: {
          in: [jaipurSingerProfileId, mumbaiCameramanProfileId, privateCreatorProfileId],
        },
      },
    });
    await prisma.creatorProfile.deleteMany({
      where: {
        userId: {
          in: [jaipurSingerUserId, mumbaiCameramanUserId, privateCreatorUserId],
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [jaipurSingerUserId, mumbaiCameramanUserId, privateCreatorUserId, viewerUserId],
        },
      },
    });
  });

  // ==========================================
  // CREATOR DISCOVERY & FILTER TESTS
  // ==========================================

  it('1. GET /api/explore/creators returns public creators with structured attributes', async () => {
    const res = await request(app).get('/api/explore/creators');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);

    const creators = res.body.data;
    const singer = creators.find((c: any) => c.id === jaipurSingerProfileId);
    assert.ok(singer, 'Jaipur singer should be present in public discovery');
    assert.strictEqual(singer.stageName, 'Aanya Swara');
    assert.strictEqual(singer.city, 'Jaipur');
    assert.strictEqual(singer.experienceLevel, ExperienceLevel.PROFESSIONAL);
    assert.strictEqual(singer.availability, AvailabilityStatus.AVAILABLE_FOR_COLLAB);
    assert.ok(typeof singer.relevanceScore === 'number');
    assert.ok(singer.scoreBreakdown);
  });

  it('2. Private creators (isPublic: false) are strictly excluded from discovery', async () => {
    const res = await request(app).get('/api/explore/creators');
    assert.strictEqual(res.status, 200);
    const privateFound = res.body.data.find((c: any) => c.id === privateCreatorProfileId);
    assert.strictEqual(privateFound, undefined, 'Private creator must NEVER appear in discovery');
  });

  it('3. Category filter returns only creators matching the specified category', async () => {
    const res = await request(app).get(`/api/explore/creators?category=music-explore-test`);
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.ok(creators.some((c: any) => c.id === jaipurSingerProfileId));
    assert.strictEqual(
      creators.some((c: any) => c.id === mumbaiCameramanProfileId),
      false,
      'Film creator should not appear under music category'
    );
  });

  it('4. Skill filter returns creators with the specified skill', async () => {
    const res = await request(app).get(`/api/explore/creators?skill=Cinematographer`);
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.ok(creators.some((c: any) => c.id === mumbaiCameramanProfileId));
    assert.strictEqual(
      creators.some((c: any) => c.id === jaipurSingerProfileId),
      false,
      'Singer should not appear for Cinematographer skill'
    );
  });

  it('5. Location filter matches creators by city / location case-insensitively', async () => {
    const res = await request(app).get(`/api/explore/creators?location=jaipur`);
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.ok(creators.some((c: any) => c.id === jaipurSingerProfileId));
    assert.strictEqual(
      creators.some((c: any) => c.id === mumbaiCameramanProfileId),
      false,
      'Mumbai creator must not appear for Jaipur location filter'
    );
  });

  it('6. Experience level filter returns only matching experience tier', async () => {
    const res = await request(app).get(
      `/api/explore/creators?experience=${ExperienceLevel.PROFESSIONAL}`
    );
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.ok(creators.some((c: any) => c.id === jaipurSingerProfileId));
    assert.strictEqual(
      creators.some((c: any) => c.id === mumbaiCameramanProfileId),
      false,
      'Advanced creator should not appear when filtering for Professional'
    );
  });

  it('7. Availability filter returns only creators matching availability status', async () => {
    const res = await request(app).get(
      `/api/explore/creators?availability=${AvailabilityStatus.OPEN_TO_WORK}`
    );
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.ok(creators.some((c: any) => c.id === mumbaiCameramanProfileId));
    assert.strictEqual(
      creators.some((c: any) => c.id === jaipurSingerProfileId),
      false,
      'AVAILABLE_FOR_COLLAB creator should not appear for OPEN_TO_WORK filter'
    );
  });

  it('8. Multi-attribute filter composition returns intersection of all criteria', async () => {
    // Search: Category=Music, Skill=Singer, Location=Jaipur, Experience=PROFESSIONAL
    const res = await request(app).get(
      `/api/explore/creators?category=music-explore-test&skill=Classical%20Singer&location=Jaipur&experience=PROFESSIONAL`
    );
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.strictEqual(creators.length, 1);
    assert.strictEqual(creators[0].id, jaipurSingerProfileId);
    assert.strictEqual(creators[0].stageName, 'Aanya Swara');
  });

  it('9. Multi-attribute query returning no match responds with empty array gracefully', async () => {
    // Search: Skill=Cinematographer in Jaipur (none exist in test set)
    const res = await request(app).get(
      `/api/explore/creators?skill=Cinematographer&location=Jaipur`
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.length, 0);
    assert.strictEqual(res.body.pagination.total, 0);
  });

  // ==========================================
  // KEYWORD SEARCH & RANKING TESTS
  // ==========================================

  it('10. Keyword search matches against stageName, headline, and bio', async () => {
    const res = await request(app).get(`/api/explore/creators?q=Hindustani`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.some((c: any) => c.id === jaipurSingerProfileId));
  });

  it('11. Multi-token keyword search ("Classical Singer in Jaipur") matches and ranks top candidate', async () => {
    const res = await request(app).get(
      `/api/explore/creators?q=Classical%20Singer%20in%20Jaipur`
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.length > 0);
    assert.strictEqual(res.body.data[0].id, jaipurSingerProfileId);
    assert.ok(res.body.data[0].relevanceScore > 40);
  });

  it('12. Deterministic scoring breakdown exposes explainable components', async () => {
    const res = await request(app).get(
      `/api/explore/creators?skill=Classical%20Singer&location=Jaipur`
    );
    assert.strictEqual(res.status, 200);
    const candidate = res.body.data.find((c: any) => c.id === jaipurSingerProfileId);
    assert.ok(candidate);
    assert.strictEqual(candidate.scoreBreakdown.skillMatch, 25, 'Primary skill match should be 25 pts');
    assert.strictEqual(candidate.scoreBreakdown.locationMatch, 15, 'Location match should be 15 pts');
    assert.ok(candidate.scoreBreakdown.profileQuality > 0);
  });

  it('13. Sorting by profile_strength orders creators by completion score descending', async () => {
    const res = await request(app).get('/api/explore/creators?sort=profile_strength');
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.ok(creators.length >= 2);
    for (let i = 0; i < creators.length - 1; i++) {
      assert.ok(
        creators[i].profileCompletionScore >= creators[i + 1].profileCompletionScore,
        'Profile completion score must be in descending order'
      );
    }
  });

  it('14. Sorting by newest orders creators by creation date descending', async () => {
    const res = await request(app).get('/api/explore/creators?sort=newest');
    assert.strictEqual(res.status, 200);
    const creators = res.body.data;
    assert.ok(creators.length >= 2);
    const date0 = new Date(creators[0].createdAt).getTime();
    const date1 = new Date(creators[1].createdAt).getTime();
    assert.ok(date0 >= date1, 'Creators must be ordered by createdAt descending');
  });

  // ==========================================
  // PAGINATION & VALIDATION TESTS
  // ==========================================

  it('15. Pagination returns limited items and accurate metadata', async () => {
    const res = await request(app).get('/api/explore/creators?page=1&limit=1');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 1);
    assert.strictEqual(res.body.pagination.page, 1);
    assert.strictEqual(res.body.pagination.limit, 1);
    assert.ok(res.body.pagination.total >= 2);
    assert.strictEqual(res.body.pagination.hasMore, true);
  });

  it('16. Invalid pagination limit (> 50) is rejected with 400 VALIDATION_ERROR', async () => {
    const res = await request(app).get('/api/explore/creators?limit=100');
    assert.strictEqual(res.status, 400);
  });

  it('17. Invalid experience level enum is rejected with 400 VALIDATION_ERROR', async () => {
    const res = await request(app).get('/api/explore/creators?experience=SUPERSTAR');
    assert.strictEqual(res.status, 400);
  });

  // ==========================================
  // POST & SHOWCASE EXPLORATION TESTS
  // ==========================================

  it('18. GET /api/explore/posts returns published showcase posts', async () => {
    const res = await request(app).get('/api/explore/posts');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));

    const post = res.body.data.find((p: any) => p.id === publishedShowcasePostId);
    assert.ok(post, 'Published showcase post must appear in explore');
    assert.strictEqual(post.title, 'Morning Raag Bhairav Showcase');
    assert.strictEqual(post.status, PostStatus.PUBLISHED);
  });

  it('19. Draft posts (DRAFT) are strictly excluded from post exploration', async () => {
    const res = await request(app).get('/api/explore/posts');
    assert.strictEqual(res.status, 200);
    const draftFound = res.body.data.find((p: any) => p.id === draftPostId);
    assert.strictEqual(draftFound, undefined, 'Draft post must NEVER appear in public post explore');
  });

  it('20. Post exploration supports postType filter', async () => {
    const res = await request(app).get(`/api/explore/posts?postType=${PostType.AUDIO}`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.some((p: any) => p.id === publishedShowcasePostId));

    const resVideo = await request(app).get(`/api/explore/posts?postType=${PostType.VIDEO}`);
    assert.strictEqual(resVideo.status, 200);
    assert.strictEqual(
      resVideo.body.data.some((p: any) => p.id === publishedShowcasePostId),
      false,
      'Audio post should not appear under video postType'
    );
  });

  // ==========================================
  // AUTHENTICATED VIEWER STATE TESTS
  // ==========================================

  it('21. Authenticated viewer receives live isFollowing relationship state', async () => {
    const res = await request(app)
      .get('/api/explore/creators')
      .set('Cookie', viewerCookie);
    assert.strictEqual(res.status, 200);

    const singer = res.body.data.find((c: any) => c.id === jaipurSingerProfileId);
    assert.ok(singer);
    assert.strictEqual(
      singer.isFollowing,
      true,
      'Viewer follows this creator, isFollowing must be true'
    );

    const cameraman = res.body.data.find((c: any) => c.id === mumbaiCameramanProfileId);
    assert.ok(cameraman);
    assert.strictEqual(
      cameraman.isFollowing,
      false,
      'Viewer does not follow cameraman, isFollowing must be false'
    );
  });

  it('22. Unauthenticated request has isFollowing as false without errors', async () => {
    const res = await request(app).get('/api/explore/creators');
    assert.strictEqual(res.status, 200);
    const singer = res.body.data.find((c: any) => c.id === jaipurSingerProfileId);
    assert.ok(singer);
    assert.strictEqual(singer.isFollowing, false);
  });

  // ==========================================
  // EXPLORE OVERVIEW ENDPOINT
  // ==========================================

  it('23. GET /api/explore returns overview combining creators, showcases, and categories', async () => {
    const res = await request(app).get('/api/explore');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.featuredCreators));
    assert.ok(Array.isArray(res.body.data.showcases));
    assert.ok(Array.isArray(res.body.data.categories));
  });

  it('24. Proficiency filter returns creators matching skill proficiency', async () => {
    const res = await request(app).get('/api/explore/creators?proficiency=EXPERT');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.some((c: any) => c.id === jaipurSingerProfileId));
  });

  it('25. Stable tie-breaker ensures deterministic ordering for identical scores', async () => {
    const res1 = await request(app).get('/api/explore/creators?sort=relevance');
    const res2 = await request(app).get('/api/explore/creators?sort=relevance');
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res2.status, 200);
    const ids1 = res1.body.data.map((c: any) => c.id);
    const ids2 = res2.body.data.map((c: any) => c.id);
    assert.deepStrictEqual(ids1, ids2, 'Multiple identical queries must return identical deterministic ordering');
  });
});
