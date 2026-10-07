import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { UserRole, PostType, PostStatus, InquiryStatus, NotificationType } from '@prisma/client';

const app = createApp();

describe('ArtVest Phase 6 - Creator Studio & Notifications Test Suite', () => {
  // Test Creators and Users
  let creatorAToken: string;
  let creatorACookie: string;
  let creatorAUserId: string;
  let creatorAProfileId: string;

  let creatorBToken: string;
  let creatorBCookie: string;
  let creatorBUserId: string;
  let creatorBProfileId: string;

  let regularUserToken: string;
  let regularUserCookie: string;
  let regularUserId: string;

  let emptyCreatorToken: string;
  let emptyCreatorCookie: string;
  let emptyCreatorUserId: string;
  let emptyCreatorProfileId: string;

  let categoryId: string;
  let postA1Id: string;
  let postA2Id: string;
  let postBId: string;
  let inquiryId: string;
  let notificationForCreatorAId: string;

  before(async () => {
    // 1. Ensure category
    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: 'Phase 6 Design',
          slug: 'phase-6-design',
        },
      });
    }
    categoryId = cat.id;

    // 2. Creator A
    const userA = await prisma.user.create({
      data: {
        email: `studio.creatorA.${Date.now()}@example.com`,
        name: 'Creator Alpha',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    creatorAUserId = userA.id;

    const profileA = await prisma.creatorProfile.create({
      data: {
        userId: creatorAUserId,
        stageName: 'Alpha Studios',
        headline: 'Creative Director',
        location: 'Mumbai, India',
        primaryCategoryId: categoryId,
        isPublic: true,
        viewCount: 42,
        profileCompletionScore: 90,
      },
    });
    creatorAProfileId = profileA.id;

    creatorAToken = AuthService.generateSessionToken({
      userId: userA.id,
      email: userA.email,
      role: userA.role,
    });
    creatorACookie = `artvest_session=${creatorAToken}`;

    // 3. Creator B
    const userB = await prisma.user.create({
      data: {
        email: `studio.creatorB.${Date.now()}@example.com`,
        name: 'Creator Beta',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    creatorBUserId = userB.id;

    const profileB = await prisma.creatorProfile.create({
      data: {
        userId: creatorBUserId,
        stageName: 'Beta Arts',
        headline: 'Motion Designer',
        location: 'Delhi, India',
        primaryCategoryId: categoryId,
        isPublic: true,
        viewCount: 10,
        profileCompletionScore: 80,
      },
    });
    creatorBProfileId = profileB.id;

    creatorBToken = AuthService.generateSessionToken({
      userId: userB.id,
      email: userB.email,
      role: userB.role,
    });
    creatorBCookie = `artvest_session=${creatorBToken}`;

    // 4. Regular User
    const regularUser = await prisma.user.create({
      data: {
        email: `studio.user.${Date.now()}@example.com`,
        name: 'Normal User',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });
    regularUserId = regularUser.id;

    regularUserToken = AuthService.generateSessionToken({
      userId: regularUser.id,
      email: regularUser.email,
      role: regularUser.role,
    });
    regularUserCookie = `artvest_session=${regularUserToken}`;

    // 5. Empty Creator (no posts, no followers, no inquiries)
    const emptyCreator = await prisma.user.create({
      data: {
        email: `studio.empty.${Date.now()}@example.com`,
        name: 'Empty Creator',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });
    emptyCreatorUserId = emptyCreator.id;

    const emptyProfile = await prisma.creatorProfile.create({
      data: {
        userId: emptyCreatorUserId,
        stageName: 'Clean Slate Studio',
        headline: 'Newbie Creator',
        location: 'Pune, India',
        primaryCategoryId: categoryId,
        isPublic: true,
        profileCompletionScore: 40,
      },
    });
    emptyCreatorProfileId = emptyProfile.id;

    emptyCreatorToken = AuthService.generateSessionToken({
      userId: emptyCreator.id,
      email: emptyCreator.email,
      role: emptyCreator.role,
    });
    emptyCreatorCookie = `artvest_session=${emptyCreatorToken}`;

    // 6. Seed Posts for Creator A
    const p1 = await prisma.post.create({
      data: {
        authorId: creatorAUserId,
        creatorProfileId: creatorAProfileId,
        categoryId,
        title: 'Alpha Post 1 - Masterpiece',
        caption: 'High engagement piece',
        postType: PostType.IMAGE,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 3600000),
      },
    });
    postA1Id = p1.id;

    const p2 = await prisma.post.create({
      data: {
        authorId: creatorAUserId,
        creatorProfileId: creatorAProfileId,
        categoryId,
        title: 'Alpha Post 2 - Draft Work',
        caption: 'Work in progress',
        postType: PostType.SHOWCASE,
        status: PostStatus.DRAFT,
      },
    });
    postA2Id = p2.id;

    // Post for Creator B
    const pB = await prisma.post.create({
      data: {
        authorId: creatorBUserId,
        creatorProfileId: creatorBProfileId,
        categoryId,
        title: 'Beta Showcase',
        caption: 'Motion reel',
        postType: PostType.VIDEO,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    postBId = pB.id;
  });

  after(async () => {
    // Teardown test entities
    const allUserIds = [creatorAUserId, creatorBUserId, regularUserId, emptyCreatorUserId];
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { recipientId: { in: allUserIds } },
          { actorId: { in: allUserIds } },
        ],
      },
    });
    await prisma.collaborationInquiry.deleteMany({
      where: {
        OR: [
          { senderId: { in: allUserIds } },
          { recipientId: { in: allUserIds } },
        ],
      },
    });
    await prisma.comment.deleteMany({
      where: { authorId: { in: allUserIds } },
    });
    await prisma.like.deleteMany({
      where: { userId: { in: allUserIds } },
    });
    await prisma.save.deleteMany({
      where: { userId: { in: allUserIds } },
    });
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: { in: allUserIds } },
          { followingId: { in: allUserIds } },
        ],
      },
    });
    await prisma.post.deleteMany({
      where: { authorId: { in: allUserIds } },
    });
    await prisma.creatorProfile.deleteMany({
      where: { userId: { in: allUserIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: allUserIds } },
    });
  });

  // ==========================================
  // NOTIFICATION DOMAIN TESTS
  // ==========================================

  it('1. Like generates notification for the post author', async () => {
    const res = await request(app)
      .post(`/api/posts/${postA1Id}/like`)
      .set('Cookie', [regularUserCookie]);

    assert.equal(res.status, 200);

    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: creatorAUserId,
        actorId: regularUserId,
        type: NotificationType.POST_LIKED,
        resourceId: postA1Id,
      },
    });

    assert.ok(notification, 'Notification should be created for post author');
    assert.equal(notification.isRead, false);
    notificationForCreatorAId = notification.id;
  });

  it('2. User liking own post does not generate notification', async () => {
    const preCount = await prisma.notification.count({
      where: { recipientId: creatorAUserId },
    });

    // Creator A likes own post
    const res = await request(app)
      .post(`/api/posts/${postA1Id}/like`)
      .set('Cookie', [creatorACookie]);

    assert.equal(res.status, 200);

    const postCount = await prisma.notification.count({
      where: { recipientId: creatorAUserId },
    });

    assert.equal(preCount, postCount, 'Self-like must not create any notification');
  });

  it('3. Comment generates notification for post author', async () => {
    const res = await request(app)
      .post(`/api/posts/${postA1Id}/comments`)
      .set('Cookie', [regularUserCookie])
      .send({ content: 'Stunning visual clarity and color grading!' });

    assert.equal(res.status, 201);

    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: creatorAUserId,
        actorId: regularUserId,
        type: NotificationType.COMMENT_CREATED,
        resourceId: postA1Id,
      },
    });

    assert.ok(notification, 'Notification should be created on comment');
    assert.equal(notification.isRead, false);
  });

  it('4. Follow generates notification for followed creator', async () => {
    const res = await request(app)
      .post(`/api/creators/${creatorAProfileId}/follow`)
      .set('Cookie', [regularUserCookie]);

    assert.equal(res.status, 200);

    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: creatorAUserId,
        actorId: regularUserId,
        type: NotificationType.CREATOR_FOLLOWED,
      },
    });

    assert.ok(notification, 'Notification should be created on follow');
  });

  it('5. Collaboration inquiry generates notification for recipient', async () => {
    const res = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [regularUserCookie])
      .send({
        recipientId: creatorAProfileId,
        postId: postA1Id,
        message: 'Would love to collaborate on a new cyberpunk film project',
      });

    assert.equal(res.status, 201);
    inquiryId = res.body.data.id;

    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: creatorAUserId,
        actorId: regularUserId,
        type: NotificationType.COLLABORATION_INQUIRY_CREATED,
        resourceId: inquiryId,
      },
    });

    assert.ok(notification, 'Notification should be created on collaboration inquiry');
  });

  it('6. Collaboration acceptance generates notification for sender', async () => {
    const res = await request(app)
      .patch(`/api/collaboration/inquiries/${inquiryId}`)
      .set('Cookie', [creatorACookie])
      .send({ status: InquiryStatus.ACCEPTED });

    assert.equal(res.status, 200);

    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: regularUserId,
        actorId: creatorAUserId,
        type: NotificationType.COLLABORATION_ACCEPTED,
        resourceId: inquiryId,
      },
    });

    assert.ok(notification, 'Notification should be created on inquiry acceptance');
  });

  it('7. Collaboration decline generates notification for sender', async () => {
    // Create second inquiry to decline
    const inqRes = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [regularUserCookie])
      .send({
        recipientId: creatorBProfileId,
        postId: postBId,
        message: 'Music composing request',
      });
    assert.equal(inqRes.status, 201);
    const inq2Id = inqRes.body.data.id;

    // Decline by Creator B
    const decRes = await request(app)
      .patch(`/api/collaboration/inquiries/${inq2Id}`)
      .set('Cookie', [creatorBCookie])
      .send({ status: InquiryStatus.DECLINED });

    assert.equal(decRes.status, 200);

    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: regularUserId,
        actorId: creatorBUserId,
        type: NotificationType.COLLABORATION_DECLINED,
        resourceId: inq2Id,
      },
    });

    assert.ok(notification, 'Notification should be created on inquiry decline');
  });

  it('8. Unauthorized notification access fails with 401', async () => {
    const res = await request(app).get('/api/notifications');
    assert.equal(res.status, 401);
  });

  it('9. User cannot read another user notification (403 forbidden)', async () => {
    // Creator B attempts to mark Creator A's notification as read
    const res = await request(app)
      .patch(`/api/notifications/${notificationForCreatorAId}/read`)
      .set('Cookie', [creatorBCookie]);

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN_NOTIFICATION_ACCESS');
  });

  it('10. Mark notification as read works and sets timestamp', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationForCreatorAId}/read`)
      .set('Cookie', [creatorACookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.isRead, true);
    assert.ok(res.body.data.readAt, 'readAt timestamp should be set');
  });

  it('11. Mark all notifications read works', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Cookie', [creatorACookie]);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.count >= 0);

    // Verify unread count is now 0 for Creator A
    const unreadRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Cookie', [creatorACookie]);

    assert.equal(unreadRes.status, 200);
    assert.equal(unreadRes.body.data.unreadCount, 0);
  });

  it('12. Unread count calculates real database unread notifications accurately', async () => {
    // Regular user has 2 notifications (ACCEPTED and DECLINED)
    const unreadRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Cookie', [regularUserCookie]);

    assert.equal(unreadRes.status, 200);
    assert.equal(unreadRes.body.data.unreadCount, 2);
  });

  it('13. Pagination works correctly on notification list', async () => {
    const res = await request(app)
      .get('/api/notifications?page=1&limit=1')
      .set('Cookie', [regularUserCookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 1);
    assert.equal(res.body.pagination.total, 2);
    assert.equal(res.body.pagination.totalPages, 2);
    assert.equal(res.body.pagination.hasMore, true);
  });

  it('14. Invalid pagination parameters are rejected with validation error', async () => {
    const res = await request(app)
      .get('/api/notifications?page=-1&limit=1000')
      .set('Cookie', [regularUserCookie]);

    assert.equal(res.status, 400);
  });

  it('15. Notification recipient is derived strictly server-side from req.user', async () => {
    // Attacker passes ?userId=creatorA to try and read Creator A's notifications
    const res = await request(app)
      .get(`/api/notifications?userId=${creatorAUserId}`)
      .set('Cookie', [regularUserCookie]);

    assert.equal(res.status, 200);
    // All returned items must belong exclusively to regularUserId
    for (const item of res.body.data) {
      assert.equal(item.recipientId, regularUserId);
    }
  });

  // ==========================================
  // CREATOR STUDIO ANALYTICS TESTS
  // ==========================================

  it('16. Creator can access own Creator Studio overview', async () => {
    const res = await request(app)
      .get('/api/studio/overview')
      .set('Cookie', [creatorACookie]);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.creator);
    assert.ok(res.body.data.metrics);
    assert.ok(res.body.data.collaboration);
    assert.ok(res.body.data.topPosts);
  });

  it('17. Normal USER cannot access Creator Studio (403 forbidden)', async () => {
    const res = await request(app)
      .get('/api/studio/overview')
      .set('Cookie', [regularUserCookie]);

    assert.equal(res.status, 403);
  });

  it('18. Unauthenticated user cannot access Creator Studio (401 unauthorized)', async () => {
    const res = await request(app).get('/api/studio/overview');
    assert.equal(res.status, 401);
  });

  it('19. Creator analytics accurately aggregate posts, engagement, and followers', async () => {
    // Add a save to postA1 from Creator B
    await request(app)
      .post(`/api/posts/${postA1Id}/save`)
      .set('Cookie', [creatorBCookie]);

    const res = await request(app)
      .get('/api/studio/overview')
      .set('Cookie', [creatorACookie]);

    assert.equal(res.status, 200);
    const { metrics, collaboration } = res.body.data;

    // Creator A has:
    // 2 total posts (1 published, 1 draft)
    assert.equal(metrics.totalPosts, 2);
    assert.equal(metrics.publishedPosts, 1);
    assert.equal(metrics.draftPosts, 1);

    // Likes: 1 (regularUser + creatorA self-like)
    assert.ok(metrics.totalLikes >= 1);
    // Comments: 1
    assert.equal(metrics.totalComments, 1);
    // Saves: 1
    assert.equal(metrics.totalSaves, 1);
    // Followers: 1
    assert.equal(metrics.totalFollowers, 1);

    // Total engagement = likes + comments + saves
    assert.equal(metrics.totalEngagement, metrics.totalLikes + metrics.totalComments + metrics.totalSaves);

    // Collaboration metrics
    assert.equal(collaboration.totalInquiries, 1);
    assert.equal(collaboration.acceptedInquiries, 1);
    assert.equal(collaboration.acceptanceRate, 100);
  });

  it('20. Deterministic top posts ranking by engagementScore = likes + comments + saves', async () => {
    const res = await request(app)
      .get('/api/studio/overview')
      .set('Cookie', [creatorACookie]);

    assert.equal(res.status, 200);
    const topPosts = res.body.data.topPosts;
    assert.ok(topPosts.length > 0);
    assert.equal(topPosts[0].id, postA1Id);
    assert.ok(topPosts[0].engagementScore > 0);
    assert.equal(
      topPosts[0].engagementScore,
      topPosts[0].likesCount + topPosts[0].commentsCount + topPosts[0].savesCount
    );
  });

  it('21. Empty creator data handles zero stats gracefully without NaN or errors', async () => {
    const res = await request(app)
      .get('/api/studio/overview')
      .set('Cookie', [emptyCreatorCookie]);

    assert.equal(res.status, 200);
    const { metrics, collaboration, topPosts, recentFollowers } = res.body.data;

    assert.equal(metrics.totalPosts, 0);
    assert.equal(metrics.publishedPosts, 0);
    assert.equal(metrics.totalLikes, 0);
    assert.equal(metrics.totalComments, 0);
    assert.equal(metrics.totalSaves, 0);
    assert.equal(metrics.totalFollowers, 0);
    assert.equal(metrics.totalEngagement, 0);
    assert.equal(collaboration.totalInquiries, 0);
    assert.equal(collaboration.acceptanceRate, 0);
    assert.equal(topPosts.length, 0);
    assert.equal(recentFollowers.length, 0);
  });

  it('22. Studio posts performance endpoint returns sorted, paginated posts', async () => {
    const res = await request(app)
      .get('/api/studio/posts?sort=engagement&page=1&limit=10')
      .set('Cookie', [creatorACookie]);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.pagination.total, 2);
    assert.equal(res.body.data[0].id, postA1Id); // Top engagement is first
  });

  it('23. Analytics strictly isolate data: Creator B does not see Creator A analytics', async () => {
    const resB = await request(app)
      .get('/api/studio/overview')
      .set('Cookie', [creatorBCookie]);

    assert.equal(resB.status, 200);
    // Creator B has only 1 post, 0 likes on their post, 0 followers
    assert.equal(resB.body.data.metrics.totalPosts, 1);
    assert.equal(resB.body.data.metrics.totalLikes, 0);
    assert.equal(resB.body.data.metrics.totalFollowers, 0);
    assert.notEqual(resB.body.data.creator.id, creatorAProfileId);
  });
});
