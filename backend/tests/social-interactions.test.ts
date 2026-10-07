import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { UserRole, PostType, PostStatus, InquiryStatus } from '@prisma/client';

const app = createApp();

describe('ArtVest Phase 4 - Social Graph & Creative Interaction Test Suite', () => {
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

  let thirdUserToken: string;
  let thirdUserCookie: string;
  let thirdUserId: string;

  let categoryId: string;
  let testPublishedPostId: string;
  let testDraftPostId: string;
  let otherPostId: string;

  let testCommentId: string;
  let testReplyId: string;
  let testInquiryId: string;

  before(async () => {
    // 1. Get taxonomy category
    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: 'Visual Arts P4',
          slug: 'visual-arts-p4',
        },
      });
    }
    categoryId = cat.id;

    // 2. Create primary creator (Author of post)
    const creatorUser = await prisma.user.create({
      data: {
        email: `p4.creator.${Date.now()}@example.com`,
        name: 'Arjun Sen',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    creatorUserId = creatorUser.id;

    const creatorProfile = await prisma.creatorProfile.create({
      data: {
        userId: creatorUserId,
        stageName: 'Arjun Visuals',
        headline: 'Cinematographer & VFX Artist',
        location: 'Mumbai, India',
        primaryCategoryId: categoryId,
        isPublic: true,
      },
    });
    creatorProfileId = creatorProfile.id;

    creatorToken = AuthService.generateSessionToken({
      userId: creatorUser.id,
      email: creatorUser.email,
      role: creatorUser.role,
    });
    creatorCookie = `artvest_session=${creatorToken}`;

    // 3. Create secondary creator
    const otherCreator = await prisma.user.create({
      data: {
        email: `p4.othercreator.${Date.now()}@example.com`,
        name: 'Tara Varma',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    otherCreatorUserId = otherCreator.id;

    const otherProfile = await prisma.creatorProfile.create({
      data: {
        userId: otherCreatorUserId,
        stageName: 'Tara Music',
        headline: 'Film Score Composer',
        location: 'Bengaluru, India',
        primaryCategoryId: categoryId,
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

    // 4. Create primary patron user
    const standardUser = await prisma.user.create({
      data: {
        email: `p4.user.${Date.now()}@example.com`,
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

    // 5. Create third user for unauthorized mutation tests
    const thirdUser = await prisma.user.create({
      data: {
        email: `p4.third.${Date.now()}@example.com`,
        name: 'Third Bystander',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });
    thirdUserId = thirdUser.id;

    thirdUserToken = AuthService.generateSessionToken({
      userId: thirdUser.id,
      email: thirdUser.email,
      role: thirdUser.role,
    });
    thirdUserCookie = `artvest_session=${thirdUserToken}`;

    // 6. Seed Posts: One published post, one draft post, one other creator post
    const publishedPost = await prisma.post.create({
      data: {
        authorId: creatorUserId,
        creatorProfileId,
        title: 'Neon Odyssey',
        caption: 'Cyberpunk short film lighting and grade study.',
        postType: PostType.IMAGE,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        categoryId,
      },
    });
    testPublishedPostId = publishedPost.id;

    const draftPost = await prisma.post.create({
      data: {
        authorId: creatorUserId,
        creatorProfileId,
        title: 'Secret Concept WIP',
        caption: 'Unpublished moodboard concept.',
        postType: PostType.TEXT,
        status: PostStatus.DRAFT,
      },
    });
    testDraftPostId = draftPost.id;

    const otherPost = await prisma.post.create({
      data: {
        authorId: otherCreatorUserId,
        creatorProfileId: otherCreatorProfileId,
        title: 'Orchestral Theme',
        caption: 'Live strings composition session.',
        postType: PostType.AUDIO,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        categoryId,
      },
    });
    otherPostId = otherPost.id;
  });

  after(async () => {
    // Cascade cleanup
    await prisma.collaborationInquiry.deleteMany({
      where: {
        OR: [
          { senderId: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] } },
          { recipientId: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] } },
        ],
      },
    });
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { authorId: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] } },
          { postId: { in: [testPublishedPostId, testDraftPostId, otherPostId] } },
        ],
      },
    });
    await prisma.like.deleteMany({
      where: {
        userId: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] },
      },
    });
    await prisma.save.deleteMany({
      where: {
        userId: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] },
      },
    });
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] } },
          { followingId: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] } },
        ],
      },
    });
    await prisma.post.deleteMany({
      where: { id: { in: [testPublishedPostId, testDraftPostId, otherPostId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [creatorUserId, otherCreatorUserId, regularUserId, thirdUserId] } },
    });
  });

  // ==========================================
  // SECTION 1: LIKES
  // ==========================================

  it('1. Authenticated user can like a published post', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/like`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.liked, true);
    assert.equal(res.body.data.count, 1);
  });

  it('2. Duplicate like is prevented / idempotent (same user liking again)', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/like`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.liked, true);
    assert.equal(res.body.data.count, 1);
  });

  it('3. GET /api/posts/:postId/likes exposes real count and user liked status', async () => {
    const res = await request(app)
      .get(`/api/posts/${testPublishedPostId}/likes`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.count, 1);
    assert.equal(res.body.data.liked, true);
  });

  it('4. Unlike removes appreciation and decrements count', async () => {
    const res = await request(app)
      .delete(`/api/posts/${testPublishedPostId}/like`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.liked, false);
    assert.equal(res.body.data.count, 0);

    // Verify DB state
    const check = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: testPublishedPostId,
          userId: regularUserId,
        },
      },
    });
    assert.equal(check, null);
  });

  it('5. Unauthenticated like attempt is rejected with 401', async () => {
    const res = await request(app).post(`/api/posts/${testPublishedPostId}/like`);
    assert.equal(res.status, 401);
  });

  it('6. Liking a draft post is strictly rejected with 400', async () => {
    const res = await request(app)
      .post(`/api/posts/${testDraftPostId}/like`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
  });

  // ==========================================
  // SECTION 2: COMMENTS & NESTED REPLIES
  // ==========================================

  it('7. Authenticated user can post a comment on a published post', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/comments`)
      .set('Cookie', [userCookie])
      .send({
        content: 'Incredible lighting contrast! Which lens did you shoot this with?',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.authorId, regularUserId);
    assert.equal(res.body.data.content, 'Incredible lighting contrast! Which lens did you shoot this with?');
    assert.equal(res.body.data.parentId, null);

    testCommentId = res.body.data.id;
  });

  it('8. Empty or whitespace-only comment is rejected with 400 validation error', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/comments`)
      .set('Cookie', [userCookie])
      .send({
        content: '   ',
      });

    assert.equal(res.status, 400);
  });

  it('9. Comment on unpublished draft post is rejected with 400', async () => {
    const res = await request(app)
      .post(`/api/posts/${testDraftPostId}/comments`)
      .set('Cookie', [userCookie])
      .send({
        content: 'This should not be allowed on drafts.',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
  });

  it('10. Comment author can edit their own comment', async () => {
    const res = await request(app)
      .patch(`/api/comments/${testCommentId}`)
      .set('Cookie', [userCookie])
      .send({
        content: 'Incredible lighting contrast! Which anamorphic lens did you shoot this with?',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(
      res.body.data.content,
      'Incredible lighting contrast! Which anamorphic lens did you shoot this with?'
    );
  });

  it("11. Another user cannot edit someone else's comment (403 Forbidden)", async () => {
    const res = await request(app)
      .patch(`/api/comments/${testCommentId}`)
      .set('Cookie', [thirdUserCookie])
      .send({
        content: 'Unauthorized edit attempt!',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'FORBIDDEN_COMMENT_MUTATION');
  });

  it('12. Authenticated user can reply to a top-level comment', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/comments`)
      .set('Cookie', [creatorCookie])
      .send({
        content: 'We used the Atlas Orion 40mm T2 with an amber flare filter!',
        parentId: testCommentId,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.parentId, testCommentId);

    testReplyId = res.body.data.id;
  });

  it('13. Replying with parent comment belonging to a different post is rejected (400)', async () => {
    const res = await request(app)
      .post(`/api/posts/${otherPostId}/comments`)
      .set('Cookie', [userCookie])
      .send({
        content: 'Cross-post parent comment reply attempt.',
        parentId: testCommentId, // Belongs to testPublishedPostId
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'INVALID_PARENT_COMMENT');
  });

  it('14. Replying to a non-existent parent comment is rejected with 404', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/comments`)
      .set('Cookie', [userCookie])
      .send({
        content: 'Orphan reply attempt.',
        parentId: 'non-existent-comment-id',
      });

    assert.equal(res.status, 404);
    assert.equal(res.body.error?.code, 'PARENT_COMMENT_NOT_FOUND');
  });

  it('15. GET /api/posts/:postId/comments returns nested structure and counts', async () => {
    const res = await request(app).get(`/api/posts/${testPublishedPostId}/comments`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.totalComments, 2); // 1 parent + 1 reply

    const parent = res.body.data.find((c: any) => c.id === testCommentId);
    assert.ok(parent, 'Top-level comment must be returned');
    assert.ok(Array.isArray(parent.replies));
    assert.equal(parent.replies.length, 1);
    assert.equal(parent.replies[0].id, testReplyId);
  });

  it("16. Unauthorized user cannot delete someone else's comment (403)", async () => {
    const res = await request(app)
      .delete(`/api/comments/${testReplyId}`)
      .set('Cookie', [thirdUserCookie]);

    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'FORBIDDEN_COMMENT_MUTATION');
  });

  it('17. Comment author can delete their own comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/${testReplyId}`)
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const check = await prisma.comment.findUnique({ where: { id: testReplyId } });
    assert.equal(check, null);
  });

  // ==========================================
  // SECTION 3: SAVES / BOOKMARKS
  // ==========================================

  it('18. Authenticated user can save a published post', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/save`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.saved, true);
    assert.equal(res.body.data.count, 1);
  });

  it('19. Duplicate save is idempotent and returns saved=true', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPublishedPostId}/save`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.saved, true);
    assert.equal(res.body.data.count, 1);
  });

  it('20. Saving a draft post is rejected with 400', async () => {
    const res = await request(app)
      .post(`/api/posts/${testDraftPostId}/save`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
  });

  it('21. GET /api/user/saved returns saved posts with pagination', async () => {
    const res = await request(app)
      .get('/api/user/saved?page=1&limit=10')
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, testPublishedPostId);
    assert.equal(res.body.data[0].savedByMe, true);
    assert.ok(res.body.pagination);
    assert.equal(res.body.pagination.totalCount, 1);
  });

  it('22. Unsave removes post from bookmarks', async () => {
    const res = await request(app)
      .delete(`/api/posts/${testPublishedPostId}/save`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.saved, false);
    assert.equal(res.body.data.count, 0);

    const check = await request(app)
      .get('/api/user/saved')
      .set('Cookie', [userCookie]);

    assert.equal(check.body.data.length, 0);
  });

  // ==========================================
  // SECTION 4: CREATOR FOLLOW GRAPH
  // ==========================================

  it('23. User can follow a creator by creator profile ID or user ID', async () => {
    const res = await request(app)
      .post(`/api/creators/${creatorProfileId}/follow`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.following, true);
    assert.equal(res.body.data.followersCount, 1);
  });

  it('24. Duplicate follow is idempotent', async () => {
    const res = await request(app)
      .post(`/api/creators/${creatorProfileId}/follow`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.following, true);
    assert.equal(res.body.data.followersCount, 1);
  });

  it('25. Self-follow is rejected with 400 CANNOT_FOLLOW_SELF', async () => {
    const res = await request(app)
      .post(`/api/creators/${creatorProfileId}/follow`)
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'CANNOT_FOLLOW_SELF');
  });

  it('26. GET /api/user/followers returns real follower list', async () => {
    const res = await request(app)
      .get(`/api/user/followers?userId=${creatorUserId}`)
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, regularUserId);
  });

  it('27. GET /api/user/following returns real following list', async () => {
    const res = await request(app)
      .get(`/api/user/following?userId=${regularUserId}`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, creatorUserId);
  });

  it('28. User can unfollow a creator', async () => {
    const res = await request(app)
      .delete(`/api/creators/${creatorProfileId}/follow`)
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.following, false);
    assert.equal(res.body.data.followersCount, 0);
  });

  // ==========================================
  // SECTION 5: COLLABORATION INQUIRIES
  // ==========================================

  it('29. User can send a structured collaboration inquiry referencing a post', async () => {
    const res = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [userCookie])
      .send({
        recipientId: creatorProfileId,
        postId: testPublishedPostId,
        message: 'I love your cyberpunk cinematography style! I am directing a sci-fi short film and would love to collaborate.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.senderId, regularUserId);
    assert.equal(res.body.data.recipientId, creatorUserId);
    assert.equal(res.body.data.postId, testPublishedPostId);
    assert.equal(res.body.data.status, InquiryStatus.PENDING);

    testInquiryId = res.body.data.id;
  });

  it('30. User cannot send a collaboration inquiry to themselves', async () => {
    const res = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [creatorCookie])
      .send({
        recipientId: creatorProfileId,
        message: 'Self collaboration attempt.',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'CANNOT_INQUIRE_SELF');
  });

  it('31. Collaboration inquiry referencing an unpublished draft post is rejected (400)', async () => {
    const res = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [userCookie])
      .send({
        recipientId: creatorProfileId,
        postId: testDraftPostId,
        message: 'Trying to reference private draft.',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
  });

  it('32. Sender can view inquiry in their sent inquiries list', async () => {
    const res = await request(app)
      .get('/api/collaboration/inquiries/sent')
      .set('Cookie', [userCookie]);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((inq: any) => inq.id === testInquiryId);
    assert.ok(found, 'Sent inquiry must appear in sender sent list');
    assert.equal(found.status, 'PENDING');
  });

  it('33. Recipient can view inquiry in their received inquiries list', async () => {
    const res = await request(app)
      .get('/api/collaboration/inquiries/received')
      .set('Cookie', [creatorCookie]);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((inq: any) => inq.id === testInquiryId);
    assert.ok(found, 'Received inquiry must appear in recipient inbox');
    assert.equal(found.status, 'PENDING');
  });

  it('34. Sender cannot accept their own inquiry (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/collaboration/inquiries/${testInquiryId}`)
      .set('Cookie', [userCookie])
      .send({
        status: InquiryStatus.ACCEPTED,
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'FORBIDDEN_INQUIRY_ACTION');
  });

  it('35. Unauthorized third party cannot modify inquiry status (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/collaboration/inquiries/${testInquiryId}`)
      .set('Cookie', [thirdUserCookie])
      .send({
        status: InquiryStatus.ACCEPTED,
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'FORBIDDEN_INQUIRY_ACTION');
  });

  it('36. Recipient creator can accept the collaboration inquiry', async () => {
    const res = await request(app)
      .patch(`/api/collaboration/inquiries/${testInquiryId}`)
      .set('Cookie', [creatorCookie])
      .send({
        status: InquiryStatus.ACCEPTED,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, InquiryStatus.ACCEPTED);
  });

  it('37. Changing status of already accepted inquiry is rejected with 400', async () => {
    const res = await request(app)
      .patch(`/api/collaboration/inquiries/${testInquiryId}`)
      .set('Cookie', [userCookie])
      .send({
        status: InquiryStatus.WITHDRAWN,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error?.code, 'INVALID_INQUIRY_STATE');
  });

  it('38. Sender can withdraw their own pending inquiry', async () => {
    // Create new inquiry to test withdraw
    const newInquiry = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [userCookie])
      .send({
        recipientId: otherCreatorProfileId,
        message: 'Would love to discuss composing music for a video project.',
      });

    assert.equal(newInquiry.status, 201);
    const inqId = newInquiry.body.data.id;

    // Sender withdraws
    const withdrawRes = await request(app)
      .patch(`/api/collaboration/inquiries/${inqId}`)
      .set('Cookie', [userCookie])
      .send({
        status: InquiryStatus.WITHDRAWN,
      });

    assert.equal(withdrawRes.status, 200);
    assert.equal(withdrawRes.body.data.status, InquiryStatus.WITHDRAWN);
  });

  it('39. Recipient can decline a pending inquiry', async () => {
    // Create new inquiry to test decline
    const newInquiry = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [thirdUserCookie])
      .send({
        recipientId: creatorProfileId,
        message: 'Looking for a DP on our weekend music video.',
      });

    assert.equal(newInquiry.status, 201);
    const inqId = newInquiry.body.data.id;

    // Recipient declines
    const declineRes = await request(app)
      .patch(`/api/collaboration/inquiries/${inqId}`)
      .set('Cookie', [creatorCookie])
      .send({
        status: InquiryStatus.DECLINED,
      });

    assert.equal(declineRes.status, 200);
    assert.equal(declineRes.body.data.status, InquiryStatus.DECLINED);
  });

  // ==========================================
  // SECTION 6: INTEGRATION VERIFICATION
  // ==========================================

  it('40. Feed and public creator profile expose real counts and states without fake data', async () => {
    // Ensure 1 like and 1 save are present
    await request(app)
      .post(`/api/posts/${testPublishedPostId}/like`)
      .set('Cookie', [userCookie]);

    await request(app)
      .post(`/api/posts/${testPublishedPostId}/save`)
      .set('Cookie', [userCookie]);

    await request(app)
      .post(`/api/creators/${creatorProfileId}/follow`)
      .set('Cookie', [userCookie]);

    // Feed request with user session cookie
    const feedRes = await request(app)
      .get('/api/feed?limit=10')
      .set('Cookie', [userCookie]);

    assert.equal(feedRes.status, 200);
    const postInFeed = feedRes.body.data.find((p: any) => p.id === testPublishedPostId);
    assert.ok(postInFeed, 'Post must appear in showcase feed');
    assert.equal(postInFeed.likeCount, 1);
    assert.equal(postInFeed.saveCount, 1);
    assert.equal(postInFeed.likedByMe, true);
    assert.equal(postInFeed.savedByMe, true);
    assert.equal(postInFeed.followingCreator, true);

    // Public creator profile
    const profileRes = await request(app)
      .get(`/api/creators/${creatorProfileId}`)
      .set('Cookie', [userCookie]);

    assert.equal(profileRes.status, 200);
    assert.equal(profileRes.body.data.followerCount, 1);
    assert.equal(profileRes.body.data.isFollowing, true);
    assert.equal(profileRes.body.data.postCount, 1);
  });
});
