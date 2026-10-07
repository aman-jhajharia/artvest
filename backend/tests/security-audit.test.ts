import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { UserRole, PostType, PostStatus, InquiryStatus } from '@prisma/client';

const app = createApp();

describe('ArtVest Phase 7 - RBAC & IDOR Security Regression Suite', () => {
  // Test entities
  let creatorAUserId: string;
  let creatorAProfileId: string;
  let creatorACookie: string;

  let creatorBUserId: string;
  let creatorBProfileId: string;
  let creatorBCookie: string;

  let regularUserId: string;
  let regularUserCookie: string;

  let attackerUserId: string;
  let attackerUserCookie: string;

  let categoryId: string;
  let publishedPostAId: string;
  let draftPostAId: string;
  let publishedPostBId: string;
  let commentAId: string;
  let inquiryId: string;
  let notificationAId: string;

  before(async () => {
    // Category
    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: 'Security Test Design',
          slug: 'security-test-design',
        },
      });
    }
    categoryId = cat.id;

    // Creator A (Target)
    const userA = await prisma.user.create({
      data: {
        email: `sec.creatorA.${Date.now()}@example.com`,
        name: 'Sec Creator A',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    creatorAUserId = userA.id;
    const profileA = await prisma.creatorProfile.create({
      data: {
        userId: userA.id,
        stageName: 'Creator A Studio',
        headline: 'Lead Architect',
        location: 'Jaipur, India',
        primaryCategoryId: categoryId,
        isPublic: true,
        viewCount: 15,
        profileCompletionScore: 85,
      },
    });
    creatorAProfileId = profileA.id;
    const tokenA = AuthService.generateSessionToken({
      userId: userA.id,
      email: userA.email,
      role: userA.role,
    });
    creatorACookie = `artvest_session=${tokenA}`;

    // Creator B (Peer Creator)
    const userB = await prisma.user.create({
      data: {
        email: `sec.creatorB.${Date.now()}@example.com`,
        name: 'Sec Creator B',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    creatorBUserId = userB.id;
    const profileB = await prisma.creatorProfile.create({
      data: {
        userId: userB.id,
        stageName: 'Creator B Studio',
        headline: 'Motion Artist',
        location: 'Mumbai, India',
        primaryCategoryId: categoryId,
        isPublic: true,
      },
    });
    creatorBProfileId = profileB.id;
    const tokenB = AuthService.generateSessionToken({
      userId: userB.id,
      email: userB.email,
      role: userB.role,
    });
    creatorBCookie = `artvest_session=${tokenB}`;

    // Regular User
    const regUser = await prisma.user.create({
      data: {
        email: `sec.reguser.${Date.now()}@example.com`,
        name: 'Regular Explorer',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });
    regularUserId = regUser.id;
    const regToken = AuthService.generateSessionToken({
      userId: regUser.id,
      email: regUser.email,
      role: regUser.role,
    });
    regularUserCookie = `artvest_session=${regToken}`;

    // Attacker User (Role: USER)
    const attackerUser = await prisma.user.create({
      data: {
        email: `sec.attacker.${Date.now()}@example.com`,
        name: 'Hostile Actor',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });
    attackerUserId = attackerUser.id;
    const attackerToken = AuthService.generateSessionToken({
      userId: attackerUser.id,
      email: attackerUser.email,
      role: attackerUser.role,
    });
    attackerUserCookie = `artvest_session=${attackerToken}`;

    // Posts for Creator A
    const postA1 = await prisma.post.create({
      data: {
        authorId: creatorAUserId,
        creatorProfileId: creatorAProfileId,
        title: 'Creator A Masterpiece',
        caption: 'Target showcase for testing security invariants.',
        description: 'Target showcase for testing security invariants.',
        postType: PostType.IMAGE,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        categoryId,
      },
    });
    publishedPostAId = postA1.id;

    const draftA = await prisma.post.create({
      data: {
        authorId: creatorAUserId,
        creatorProfileId: creatorAProfileId,
        title: 'Creator A Secret Draft',
        caption: 'Unpublished draft showcase that should reject public interactions.',
        description: 'Unpublished draft showcase that should reject public interactions.',
        postType: PostType.IMAGE,
        status: PostStatus.DRAFT,
        categoryId,
      },
    });
    draftPostAId = draftA.id;

    // Post for Creator B
    const postB1 = await prisma.post.create({
      data: {
        authorId: creatorBUserId,
        creatorProfileId: creatorBProfileId,
        title: 'Creator B Work',
        caption: 'Post from Creator B to test cross-post comment parent validation.',
        description: 'Post from Creator B to test cross-post comment parent validation.',
        postType: PostType.IMAGE,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        categoryId,
      },
    });
    publishedPostBId = postB1.id;

    // Comment on Post A by Creator A
    const commentA = await prisma.comment.create({
      data: {
        postId: publishedPostAId,
        authorId: creatorAUserId,
        content: 'Original comment by Creator A',
      },
    });
    commentAId = commentA.id;

    // Inquiry from Regular User to Creator A
    const inq = await prisma.collaborationInquiry.create({
      data: {
        senderId: regularUserId,
        recipientId: creatorAUserId,
        message: 'Would love to discuss an architectural collaboration on ArtVest.',
        status: InquiryStatus.PENDING,
      },
    });
    inquiryId = inq.id;

    // Notification for Creator A
    const notif = await prisma.notification.create({
      data: {
        recipientId: creatorAUserId,
        actorId: regularUserId,
        type: 'COLLABORATION_INQUIRY_CREATED',
        resourceId: inquiryId,
        resourceType: 'INQUIRY',
        title: 'New Collaboration Inquiry',
        message: 'Regular Explorer sent you an inquiry',
      },
    });
    notificationAId = notif.id;
  });

  after(async () => {
    // Cleanup created records
    try {
      await prisma.notification.deleteMany({
        where: { recipientId: { in: [creatorAUserId, creatorBUserId, regularUserId, attackerUserId] } },
      });
      await prisma.collaborationInquiry.deleteMany({
        where: { id: inquiryId },
      });
      await prisma.comment.deleteMany({
        where: { postId: { in: [publishedPostAId, draftPostAId, publishedPostBId] } },
      });
      await prisma.post.deleteMany({
        where: { id: { in: [publishedPostAId, draftPostAId, publishedPostBId] } },
      });
      await prisma.creatorProfile.deleteMany({
        where: { userId: { in: [creatorAUserId, creatorBUserId] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [creatorAUserId, creatorBUserId, regularUserId, attackerUserId] } },
      });
    } catch {
      // Ignore cleanup error in test tear-down
    }
  });

  // ========================================================
  // 1. RBAC — CREATOR STUDIO ACCESS CONTROL
  // ========================================================
  describe('RBAC: Creator Studio Access Protection', () => {
    it('should reject unauthenticated requests to Studio Overview with 401', async () => {
      const res = await request(app).get('/api/studio/overview');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });

    it('should reject USER role requests to Studio Overview with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/studio/overview')
        .set('Cookie', regularUserCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should reject unauthenticated requests to Studio Posts with 401', async () => {
      const res = await request(app).get('/api/studio/posts');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('should reject USER role requests to Studio Posts with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/studio/posts')
        .set('Cookie', regularUserCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it('should permit verified CREATOR role access to Studio Overview with 200', async () => {
      const res = await request(app)
        .get('/api/studio/overview')
        .set('Cookie', creatorACookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.metrics);
      assert.equal(typeof res.body.data.metrics.totalPosts, 'number');
    });
  });

  // ========================================================
  // 2. IDOR — CREATOR PROFILE & IDENTITY SPOOFING
  // ========================================================
  describe('IDOR & RBAC: Creator Profile Protection', () => {
    it('should reject unauthenticated access to /api/creator/profile with 401', async () => {
      const res = await request(app).get('/api/creator/profile');
      assert.equal(res.status, 401);
    });

    it('should reject USER role access to /api/creator/profile with 403', async () => {
      const res = await request(app)
        .get('/api/creator/profile')
        .set('Cookie', regularUserCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should ignore forged userId/creatorId in profile update body and only update caller profile', async () => {
      // Creator B attempts to pass Creator A's userId and stageName in body
      const res = await request(app)
        .patch('/api/creator/profile')
        .set('Cookie', creatorBCookie)
        .send({
          userId: creatorAUserId,
          stageName: 'Creator B Legitimate Update',
          headline: 'Hacked Headline Attempt',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Verify Creator A's profile remained completely untouched
      const targetProfile = await prisma.creatorProfile.findUnique({
        where: { id: creatorAProfileId },
      });
      assert.equal(targetProfile?.stageName, 'Creator A Studio');
      assert.equal(targetProfile?.headline, 'Lead Architect');

      // Verify Creator B's profile was the one updated
      const callerProfile = await prisma.creatorProfile.findUnique({
        where: { id: creatorBProfileId },
      });
      assert.equal(callerProfile?.stageName, 'Creator B Legitimate Update');
    });
  });

  // ========================================================
  // 3. IDOR — SHOWCASE POST MUTATION & DELETION
  // ========================================================
  describe('IDOR: Post Modification & Deletion Boundaries', () => {
    it('should reject modification of Creator A post by Creator B with 403 FORBIDDEN_POST_MUTATION', async () => {
      const res = await request(app)
        .patch(`/api/posts/${publishedPostAId}`)
        .set('Cookie', creatorBCookie)
        .send({
          title: 'Defaced Post Title',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_POST_MUTATION');

      // Confirm post title remained intact
      const post = await prisma.post.findUnique({ where: { id: publishedPostAId } });
      assert.equal(post?.title, 'Creator A Masterpiece');
    });

    it('should reject deletion of Creator A post by regular user with 403 FORBIDDEN (RBAC)', async () => {
      const res = await request(app)
        .delete(`/api/posts/${publishedPostAId}`)
        .set('Cookie', regularUserCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');

      // Confirm post still exists
      const post = await prisma.post.findUnique({ where: { id: publishedPostAId } });
      assert.ok(post);
    });

    it('should reject deletion of Creator A post by peer Creator B with 403 FORBIDDEN_POST_MUTATION (IDOR)', async () => {
      const res = await request(app)
        .delete(`/api/posts/${publishedPostAId}`)
        .set('Cookie', creatorBCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_POST_MUTATION');

      // Confirm post still exists
      const post = await prisma.post.findUnique({ where: { id: publishedPostAId } });
      assert.ok(post);
    });

    it('should reject publishing another creator draft post with 403 FORBIDDEN_POST_MUTATION', async () => {
      const res = await request(app)
        .post(`/api/posts/${draftPostAId}/publish`)
        .set('Cookie', creatorBCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_POST_MUTATION');
    });
  });

  // ========================================================
  // 4. IDOR — COMMENT MUTATION & DELETION
  // ========================================================
  describe('IDOR: Comment Modification & Deletion Boundaries', () => {
    it('should reject editing Creator A comment by regular user with 403 FORBIDDEN_COMMENT_MUTATION', async () => {
      const res = await request(app)
        .patch(`/api/comments/${commentAId}`)
        .set('Cookie', regularUserCookie)
        .send({
          content: 'Malicious modification of comment',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_COMMENT_MUTATION');

      // Confirm original comment content unchanged
      const c = await prisma.comment.findUnique({ where: { id: commentAId } });
      assert.equal(c?.content, 'Original comment by Creator A');
    });

    it('should reject deleting Creator A comment by Creator B with 403 FORBIDDEN_COMMENT_MUTATION', async () => {
      const res = await request(app)
        .delete(`/api/comments/${commentAId}`)
        .set('Cookie', creatorBCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_COMMENT_MUTATION');

      // Confirm comment still exists
      const c = await prisma.comment.findUnique({ where: { id: commentAId } });
      assert.ok(c);
    });
  });

  // ========================================================
  // 5. IDOR — NOTIFICATION PRIVACY & STATE MUTATION
  // ========================================================
  describe('IDOR: Notification Access & Mutation Boundaries', () => {
    it('should reject marking foreign notification as read with 403 FORBIDDEN_NOTIFICATION_ACCESS', async () => {
      // Attacker attempts to mark Creator A's notification as read
      const res = await request(app)
        .patch(`/api/notifications/${notificationAId}/read`)
        .set('Cookie', attackerUserCookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_NOTIFICATION_ACCESS');

      // Confirm notification remains unread
      const notif = await prisma.notification.findUnique({ where: { id: notificationAId } });
      assert.equal(notif?.isRead, false);
    });

    it('should strictly derive recipient from session token and ignore forged recipientId query params', async () => {
      // Attacker tries to query notifications with ?recipientId=creatorAUserId
      const res = await request(app)
        .get(`/api/notifications?recipientId=${creatorAUserId}`)
        .set('Cookie', attackerUserCookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      // Attacker should see 0 notifications (not Creator A's notification)
      assert.equal(res.body.data.length, 0);
      assert.equal(res.body.pagination.total, 0);
    });

    it('should allow legitimate recipient to mark notification as read with 200', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notificationAId}/read`)
        .set('Cookie', creatorACookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.isRead, true);
    });
  });

  // ========================================================
  // 6. COLLABORATION INQUIRY AUTHORIZATION & STATE TRANSITIONS
  // ========================================================
  describe('Authorization: Collaboration Inquiry State Transitions', () => {
    it('should reject unauthorized third-party user updating inquiry status with 403 FORBIDDEN_INQUIRY_ACTION', async () => {
      // Creator B (neither sender nor recipient) attempts to decline
      const res = await request(app)
        .patch(`/api/collaboration/inquiries/${inquiryId}`)
        .set('Cookie', creatorBCookie)
        .send({ status: 'DECLINED' });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_INQUIRY_ACTION');
    });

    it('should reject sender attempting to accept their own inquiry with 403 FORBIDDEN_INQUIRY_ACTION', async () => {
      // Regular user (the sender) tries to ACCEPT their own inquiry
      const res = await request(app)
        .patch(`/api/collaboration/inquiries/${inquiryId}`)
        .set('Cookie', regularUserCookie)
        .send({ status: 'ACCEPTED' });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN_INQUIRY_ACTION');
    });

    it('should permit valid recipient creator to accept the inquiry', async () => {
      const res = await request(app)
        .patch(`/api/collaboration/inquiries/${inquiryId}`)
        .set('Cookie', creatorACookie)
        .send({ status: 'ACCEPTED' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'ACCEPTED');
    });

    it('should reject invalid state transition on already ACCEPTED inquiry with 400 INVALID_INQUIRY_STATE', async () => {
      // Attempt to change accepted inquiry to DECLINED
      const res = await request(app)
        .patch(`/api/collaboration/inquiries/${inquiryId}`)
        .set('Cookie', creatorACookie)
        .send({ status: 'DECLINED' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_INQUIRY_STATE');
    });
  });

  // ========================================================
  // 7. SOCIAL GRAPH INTEGRITY & UNPUBLISHED POST BOUNDARIES
  // ========================================================
  describe('Integrity: Social Interaction Boundaries', () => {
    it('should reject self-follow attempt with 400 CANNOT_FOLLOW_SELF', async () => {
      const res = await request(app)
        .post(`/api/creators/${creatorAUserId}/follow`)
        .set('Cookie', creatorACookie);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'CANNOT_FOLLOW_SELF');
    });

    it('should reject liking an unpublished draft post with 400 CANNOT_INTERACT_WITH_UNPUBLISHED_POST', async () => {
      const res = await request(app)
        .post(`/api/posts/${draftPostAId}/like`)
        .set('Cookie', regularUserCookie);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
    });

    it('should reject commenting on an unpublished draft post with 400 CANNOT_INTERACT_WITH_UNPUBLISHED_POST', async () => {
      const res = await request(app)
        .post(`/api/posts/${draftPostAId}/comments`)
        .set('Cookie', regularUserCookie)
        .send({ content: 'Attempting to comment on draft work' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'CANNOT_INTERACT_WITH_UNPUBLISHED_POST');
    });

    it('should reject comment referencing parent comment on a DIFFERENT post with 400 INVALID_PARENT_COMMENT', async () => {
      // Comment on Post B referencing commentAId (which belongs to Post A)
      const res = await request(app)
        .post(`/api/posts/${publishedPostBId}/comments`)
        .set('Cookie', regularUserCookie)
        .send({
          content: 'Replying to comment from wrong post',
          parentId: commentAId,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_PARENT_COMMENT');
    });

    it('should reject comment referencing non-existent parent comment with 404 PARENT_COMMENT_NOT_FOUND', async () => {
      const res = await request(app)
        .post(`/api/posts/${publishedPostAId}/comments`)
        .set('Cookie', regularUserCookie)
        .send({
          content: 'Replying to ghost comment',
          parentId: 'cuid_non_existent_comment_parent_99999',
        });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'PARENT_COMMENT_NOT_FOUND');
    });

    it('should suppress self-notification when author likes their own post', async () => {
      // Count notifications for Creator A before
      const countBefore = await prisma.notification.count({
        where: { recipientId: creatorAUserId, type: 'POST_LIKED' },
      });

      // Creator A likes their own post
      const likeRes = await request(app)
        .post(`/api/posts/${publishedPostAId}/like`)
        .set('Cookie', creatorACookie);

      assert.equal(likeRes.status, 200);

      // Verify no self-notification was created
      const countAfter = await prisma.notification.count({
        where: { recipientId: creatorAUserId, type: 'POST_LIKED' },
      });

      assert.equal(countAfter, countBefore);
    });
  });
});
