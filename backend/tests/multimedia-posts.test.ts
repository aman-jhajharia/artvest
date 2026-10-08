import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { config } from '../src/config/index.js';
import { UserRole, PostType, PostStatus, MediaType } from '@prisma/client';

const app = createApp();

describe('ArtVest Phase 3 - Multimedia Portfolio & Showcase Posts Test Suite', () => {
  let creatorToken: string;
  let creatorCookie: string;
  let creatorUserId: string;
  let creatorProfileId: string;

  let otherCreatorToken: string;
  let otherCreatorCookie: string;
  let otherCreatorUserId: string;
  let otherCreatorProfileId: string;

  let userToken: string;
  let userCookie: string;
  let regularUserId: string;

  let visualArtCategoryId: string;
  let paintingSkillId: string;
  let musicCategoryId: string;
  let singerSkillId: string;

  let testDraftPostId: string;
  let testPublishedPostId: string;

  before(async () => {
    // 1. Fetch seed taxonomy data
    let visualCat = await prisma.category.findUnique({ where: { slug: 'visual-arts' } });
    if (!visualCat) {
      visualCat = await prisma.category.findFirst();
    }
    assert.ok(visualCat, 'Category must exist in taxonomy');
    visualArtCategoryId = visualCat.id;

    let paintingSkill = await prisma.skill.findFirst({ where: { categoryId: visualArtCategoryId } });
    if (!paintingSkill) {
      paintingSkill = await prisma.skill.findFirst();
    }
    assert.ok(paintingSkill, 'Skill must exist');
    paintingSkillId = paintingSkill.id;

    let musicCat = await prisma.category.findUnique({ where: { slug: 'music' } });
    if (!musicCat) {
      musicCat = visualCat;
    }
    musicCategoryId = musicCat.id;

    let singerSkill = await prisma.skill.findFirst({ where: { categoryId: musicCategoryId } });
    if (!singerSkill) {
      singerSkill = paintingSkill;
    }
    singerSkillId = singerSkill.id;

    // 2. Create primary test creator
    const creatorUser = await prisma.user.create({
      data: {
        email: `phase3.creator.${Date.now()}@example.com`,
        name: 'Maya Lin',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    creatorUserId = creatorUser.id;

    const creatorProfile = await prisma.creatorProfile.create({
      data: {
        userId: creatorUserId,
        stageName: 'Studio Maya',
        headline: 'Contemporary Digital & Visual Sculptor',
        bio: 'Pushing boundaries in spatial audio, generative visual sculpture, and architectural forms.',
        location: 'Bengaluru, India',
        primaryCategoryId: visualArtCategoryId,
        profileCompletionScore: 90,
        isPublic: true,
      },
    });
    creatorProfileId = creatorProfile.id;

    await prisma.creatorSkill.create({
      data: {
        creatorProfileId: creatorProfile.id,
        skillId: paintingSkillId,
        isPrimary: true,
      },
    });

    creatorToken = AuthService.generateSessionToken({
      userId: creatorUser.id,
      email: creatorUser.email,
      role: creatorUser.role,
    });
    creatorCookie = `artvest_session=${creatorToken}`;

    // 3. Create secondary test creator for ownership isolation tests
    const otherCreator = await prisma.user.create({
      data: {
        email: `phase3.other.${Date.now()}@example.com`,
        name: 'Zane Malik',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    otherCreatorUserId = otherCreator.id;

    const otherProfile = await prisma.creatorProfile.create({
      data: {
        userId: otherCreatorUserId,
        stageName: 'Zane Sounds',
        headline: 'Electronic Music Producer',
        location: 'Mumbai, India',
        primaryCategoryId: musicCategoryId,
        isPublic: true,
      },
    });
    otherCreatorProfileId = otherProfile.id;

    otherCreatorToken = AuthService.generateSessionToken({
      userId: otherCreator.id,
      email: otherCreator.email,
      role: otherCreator.role,
    });
    otherCreatorCookie = `artvest_session=${otherCreatorToken}`;

    // 4. Create standard patron user
    const standardUser = await prisma.user.create({
      data: {
        email: `phase3.user.${Date.now()}@example.com`,
        name: 'Karan Patron',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });
    regularUserId = standardUser.id;

    userToken = AuthService.generateSessionToken({
      userId: standardUser.id,
      email: standardUser.email,
      role: standardUser.role,
    });
    userCookie = `artvest_session=${userToken}`;
  });

  after(async () => {
    // Cascade cleanup
    await prisma.post.deleteMany({
      where: { authorId: { in: [creatorUserId, otherCreatorUserId, regularUserId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [creatorUserId, otherCreatorUserId, regularUserId] } },
    });
  });

  // 1. Creator can create draft
  it('1. Creator can create a showcase draft with initial metadata and media', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', [creatorCookie])
      .send({
        title: 'Geometric Echoes Draft',
        caption: 'Work in progress geometric series exploring light refraction.',
        description: 'Detailed process notes: rendered using Blender and Octane with custom raytracing.',
        postType: 'IMAGE',
        status: 'DRAFT',
        categoryId: visualArtCategoryId,
        skillIds: [paintingSkillId],
        tags: ['geometry', 'sculpture', 'wip'],
        media: [
          {
            mediaType: 'IMAGE',
            url: 'https://res.cloudinary.com/artvest/image/upload/v1/mock_sample1.jpg',
            thumbnailUrl: 'https://res.cloudinary.com/artvest/image/upload/c_thumb,w_300/mock_sample1.jpg',
            aspectRatio: '16:9',
            mimeType: 'image/jpeg',
            fileSize: 1024000,
            width: 1920,
            height: 1080,
            orderIndex: 0,
          },
        ],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'DRAFT');
    assert.equal(res.body.data.title, 'Geometric Echoes Draft');
    assert.equal(res.body.data.authorId, creatorUserId);
    assert.equal(res.body.data.creatorProfileId, creatorProfileId);
    assert.equal(res.body.data.media.length, 1);
    assert.equal(res.body.data.skills.length, 1);

    testDraftPostId = res.body.data.id;
  });

  // 2. Creator can retrieve own posts (Studio management)
  it('2. Creator can retrieve own posts including drafts in Creator Studio', async () => {
    const res = await request(app)
      .get('/api/creator/posts')
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((p: any) => p.id === testDraftPostId);
    assert.ok(found, 'Created draft must appear in creator studio posts');
    assert.equal(found.status, 'DRAFT');
  });

  // 3. Creator can update own post
  it('3. Creator can update own draft post details and media', async () => {
    const res = await request(app)
      .patch(`/api/posts/${testDraftPostId}`)
      .set('Cookie', [creatorCookie])
      .send({
        title: 'Geometric Echoes - Revised Draft',
        caption: 'Updated lighting reflections and materials.',
        tags: ['geometry', '3d', 'revised'],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Geometric Echoes - Revised Draft');
    assert.equal(res.body.data.caption, 'Updated lighting reflections and materials.');
    assert.deepEqual(res.body.data.tags, ['geometry', '3d', 'revised']);
  });

  // 4. Creator cannot update another creator's post
  it("4. Creator cannot update another creator's post (Server-side 403 Forbidden)", async () => {
    const res = await request(app)
      .patch(`/api/posts/${testDraftPostId}`)
      .set('Cookie', [otherCreatorCookie])
      .send({
        title: 'Hacked Title By Other Creator',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'FORBIDDEN_POST_MUTATION');

    // Verify database remains unchanged
    const original = await prisma.post.findUnique({ where: { id: testDraftPostId } });
    assert.equal(original?.title, 'Geometric Echoes - Revised Draft');
  });

  // 5. Creator can delete own draft
  it('5. Creator can delete own draft, while other creators cannot delete it', async () => {
    // Create a temporary draft to delete
    const tempDraft = await prisma.post.create({
      data: {
        authorId: creatorUserId,
        creatorProfileId,
        caption: 'Temporary draft for deletion test',
        status: PostStatus.DRAFT,
      },
    });

    // Other creator attempt: must fail with 403
    const badDelete = await request(app)
      .delete(`/api/posts/${tempDraft.id}`)
      .set('Cookie', [otherCreatorCookie]);

    assert.equal(badDelete.status, 403);

    // True author deletes: succeeds with 200
    const goodDelete = await request(app)
      .delete(`/api/posts/${tempDraft.id}`)
      .set('Cookie', [creatorCookie]);

    assert.equal(goodDelete.status, 200);

    const check = await prisma.post.findUnique({ where: { id: tempDraft.id } });
    assert.equal(check, null, 'Post must be deleted from database');
  });

  // 6. Creator can publish valid post
  it('6. Creator can publish a valid post transitioning from DRAFT to PUBLISHED', async () => {
    const res = await request(app)
      .post(`/api/posts/${testDraftPostId}/publish`)
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'PUBLISHED');
    assert.ok(res.body.data.publishedAt, 'publishedAt timestamp must be recorded');

    testPublishedPostId = res.body.data.id;
  });

  // 7. Invalid post cannot be published
  it('7. Incomplete post cannot be published (e.g. IMAGE post without media, or missing required fields)', async () => {
    // Create incomplete IMAGE draft without any media
    const incompleteDraft = await prisma.post.create({
      data: {
        authorId: creatorUserId,
        creatorProfileId,
        title: 'Empty Canvas',
        caption: 'Incomplete artwork missing image media',
        postType: PostType.IMAGE,
        status: PostStatus.DRAFT,
        categoryId: visualArtCategoryId,
      },
    });

    const res = await request(app)
      .post(`/api/posts/${incompleteDraft.id}/publish`)
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'CANNOT_PUBLISH_INCOMPLETE_POST');
    assert.ok(res.body.message.includes('Image showcase posts must contain at least one uploaded image'));

    // Clean up temporary draft
    await prisma.post.delete({ where: { id: incompleteDraft.id } });
  });

  // 8. Draft does not appear in public feed
  it('8. Draft posts do not appear in public showcase feed (GET /api/feed)', async () => {
    // Create an explicit draft
    const hiddenDraft = await prisma.post.create({
      data: {
        authorId: creatorUserId,
        creatorProfileId,
        title: 'Secret Unfinished Work',
        caption: 'This must never leak into public showcase feed',
        status: PostStatus.DRAFT,
      },
    });

    const feedRes = await request(app).get('/api/feed');
    assert.equal(feedRes.status, 200);
    assert.equal(feedRes.body.success, true);

    const leaked = feedRes.body.data.find((p: any) => p.id === hiddenDraft.id);
    assert.equal(leaked, undefined, 'Draft post must NOT appear in feed');

    // Clean up
    await prisma.post.delete({ where: { id: hiddenDraft.id } });
  });

  // 9. Published post appears in feed
  it('9. Published post appears in public showcase feed with creator details and media', async () => {
    const res = await request(app).get('/api/feed');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const postInFeed = res.body.data.find((p: any) => p.id === testPublishedPostId);
    assert.ok(postInFeed, 'Published post must appear in feed');
    assert.equal(postInFeed.status, 'PUBLISHED');
    assert.ok(postInFeed.creatorProfile, 'Feed item must include creatorProfile');
    assert.equal(postInFeed.creatorProfile.stageName, 'Studio Maya');
    assert.ok(postInFeed.media.length > 0, 'Feed item must include media');
  });

  // 10. Published post appears on creator profile
  it('10. Published post appears on creator public profile portfolio', async () => {
    const res = await request(app).get(`/api/creators/${creatorUserId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const portfolio = res.body.data.portfolio;
    assert.ok(Array.isArray(portfolio));
    const found = portfolio.find((p: any) => p.id === testPublishedPostId);
    assert.ok(found, 'Published post must appear on creator profile portfolio');
    assert.equal(found.status, 'PUBLISHED');
  });

  // 11. Featured post appears first in portfolio
  it('11. Featured showcase post appears first in portfolio ordering', async () => {
    // Create an earlier published post
    const secondPost = await prisma.post.create({
      data: {
        authorId: creatorUserId,
        creatorProfileId,
        title: 'Older Showcase Artwork',
        caption: 'Older classic piece from earlier collection',
        postType: PostType.IMAGE,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 100000),
        isFeatured: false,
      },
    });

    // Feature testPublishedPostId
    const featureRes = await request(app)
      .post(`/api/posts/${testPublishedPostId}/feature`)
      .set('Cookie', [creatorCookie])
      .send({ isFeatured: true });

    assert.equal(featureRes.status, 200);
    assert.equal(featureRes.body.data.isFeatured, true);

    // Fetch creator profile portfolio
    const profileRes = await request(app).get(`/api/creators/${creatorUserId}`);
    assert.equal(profileRes.status, 200);
    const portfolio = profileRes.body.data.portfolio;

    assert.ok(portfolio.length >= 2);
    assert.equal(portfolio[0].id, testPublishedPostId, 'Featured post must appear first in portfolio');
    assert.equal(portfolio[0].isFeatured, true);

    // Clean up secondPost
    await prisma.post.delete({ where: { id: secondPost.id } });
  });

  // 12. Non-creator USER cannot create posts
  it('12. Standard USER without creator profile cannot create posts (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', [userCookie])
      .send({
        title: 'Patron Attempt to Create Post',
        caption: 'This should be rejected by requireRole(CREATOR)',
        postType: 'IMAGE',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'FORBIDDEN');
  });

  // 13. Invalid media type is rejected
  it('13. Disallowed media format is rejected with 400 UNSUPPORTED_MEDIA_TYPE', async () => {
    const fakeTextFile = Buffer.from('console.log("hello exe");');

    const res = await request(app)
      .post('/api/media/upload')
      .set('Cookie', [creatorCookie])
      .attach('file', fakeTextFile, { filename: 'payload.exe', contentType: 'application/x-msdownload' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'UNSUPPORTED_MEDIA_TYPE');
  });

  // 14. File size limit is enforced
  it('14. Oversized media file exceeds limit and is rejected with 400 FILE_TOO_LARGE', async () => {
    // 11MB image buffer (limit is 10MB)
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024, 0);

    const res = await request(app)
      .post('/api/media/upload')
      .set('Cookie', [creatorCookie])
      .attach('file', oversizedBuffer, { filename: 'huge_photo.jpg', contentType: 'image/jpeg' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'FILE_TOO_LARGE');
  });

  // 15. Post ownership is strictly enforced on all mutations
  it('15. Post author ownership is strictly enforced across publish, feature, and delete', async () => {
    // Other creator cannot publish Maya's draft
    const newDraft = await prisma.post.create({
      data: {
        authorId: creatorUserId,
        creatorProfileId,
        caption: 'Maya draft',
        status: PostStatus.DRAFT,
      },
    });

    const badPublish = await request(app)
      .post(`/api/posts/${newDraft.id}/publish`)
      .set('Cookie', [otherCreatorCookie]);
    assert.equal(badPublish.status, 403);

    const badFeature = await request(app)
      .post(`/api/posts/${newDraft.id}/feature`)
      .set('Cookie', [otherCreatorCookie]);
    assert.equal(badFeature.status, 403);

    await prisma.post.delete({ where: { id: newDraft.id } });
  });

  // 16. Feed pagination works properly
  it('16. Showcase feed supports limit and offset/cursor pagination', async () => {
    const page1 = await request(app).get('/api/feed?limit=1&page=1');
    assert.equal(page1.status, 200);
    assert.equal(page1.body.success, true);
    assert.equal(page1.body.pagination.limit, 1);
    assert.equal(page1.body.pagination.page, 1);
    assert.ok(page1.body.data.length <= 1);
    assert.ok(page1.body.pagination.totalCount >= 1);
  });

  // 17. Development fallback returns absolute backend URL
  it('17. Local file upload in development fallback returns absolute backend URL', async () => {
    const fakeImageBuffer = Buffer.from('FAKE_IMAGE_DATA_123');
    const res = await request(app)
      .post('/api/media/upload')
      .set('Cookie', [creatorCookie])
      .attach('file', fakeImageBuffer, { filename: 'test_dev_art.png', contentType: 'image/png' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.mediaUrl.startsWith('http://localhost:'), 'Must return absolute backend URL, not bare relative /uploads/...');
    assert.ok(res.body.data.mediaUrl.includes('/uploads/'));
    assert.equal(res.body.data.mediaType, 'IMAGE');

    // Clean up created local file
    if (res.body.data.meta?.localFilename) {
      const localFilePath = path.join(process.cwd(), 'uploads', res.body.data.meta.localFilename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
  });

  // 18. Production Cloudinary guard rejects upload with 503 STORAGE_UNCONFIGURED if unconfigured
  it('18. Production mode without Cloudinary credentials fails with 503 STORAGE_UNCONFIGURED and writes no file', async () => {
    const originalEnv = config.env;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filesBefore = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];

    try {
      // Simulate production environment
      (config as any).env = 'production';

      const fakeImageBuffer = Buffer.from('PRODUCTION_UNCONFIGURED_GUARD_TEST');
      const res = await request(app)
        .post('/api/media/upload')
        .set('Cookie', [creatorCookie])
        .attach('file', fakeImageBuffer, { filename: 'prod_blocked.png', contentType: 'image/png' });

      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error?.code, 'STORAGE_UNCONFIGURED');
      assert.equal(res.body.message, 'Cloudinary storage is required in production');

      // Verify NO files were written to uploadsDir
      const filesAfter = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
      assert.equal(filesAfter.length, filesBefore.length, 'No file should be written to local storage in production');
    } finally {
      (config as any).env = originalEnv;
    }
  });

  // 19. Production Cloudinary guard rejects signature endpoint with 503 STORAGE_UNCONFIGURED if unconfigured
  it('19. Production mode without Cloudinary credentials rejects upload signature with 503', async () => {
    const originalEnv = config.env;
    try {
      (config as any).env = 'production';
      const res = await request(app)
        .post('/api/media/upload-signature')
        .set('Cookie', [creatorCookie]);

      assert.equal(res.status, 503);
      assert.equal(res.body.error?.code, 'STORAGE_UNCONFIGURED');
    } finally {
      (config as any).env = originalEnv;
    }
  });

  // 20. Frontend media URL resolver rules (Section 8.C)
  it('20. Frontend resolveMediaUrl resolves paths according to specification', async () => {
    const { resolveMediaUrl } = await import('../../frontend/src/features/posts/utils/mediaUrl.ts');

    // Rule 1: Empty / falsy
    assert.equal(resolveMediaUrl(''), '');
    assert.equal(resolveMediaUrl(null as any), '');
    assert.equal(resolveMediaUrl(undefined as any), '');

    // Rule 2: Absolute Cloudinary URL unchanged
    const cloudUrl = 'https://res.cloudinary.com/example/image/upload/test.jpg';
    assert.equal(resolveMediaUrl(cloudUrl), cloudUrl);

    // Rule 3: Absolute localhost URL unchanged
    const localAbsolute = 'http://localhost:5000/uploads/test.jpg';
    assert.equal(resolveMediaUrl(localAbsolute), localAbsolute);

    // Rule 4: Relative /uploads/... resolved against backend origin
    const resolvedRelative = resolveMediaUrl('/uploads/test.jpg');
    assert.ok(resolvedRelative.startsWith('http://localhost:5000/uploads/test.jpg'));

    // Rule 5: No duplicate /api in path
    assert.ok(!resolvedRelative.includes('/api/uploads'));
    assert.ok(!resolvedRelative.includes('/api/api'));
  });

  // 21. Verify all required frontend media components use resolveMediaUrl (Section 8.D)
  it('21. Required frontend media components implement resolveMediaUrl', async () => {
    const componentPaths = [
      '../frontend/src/features/posts/components/ImagePreview.tsx',
      '../frontend/src/features/posts/components/VideoPreview.tsx',
      '../frontend/src/features/posts/components/AudioPreview.tsx',
      '../frontend/src/features/posts/components/MediaGallery.tsx',
      '../frontend/src/features/posts/components/MediaUploader.tsx',
    ];

    for (const relPath of componentPaths) {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert.ok(fs.existsSync(fullPath), `Component file must exist: ${relPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(content.includes('resolveMediaUrl'), `${relPath} must import and use resolveMediaUrl`);
    }
  });
});

