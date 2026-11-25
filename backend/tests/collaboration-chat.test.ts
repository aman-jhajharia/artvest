import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { UserRole, InquiryStatus, NotificationType } from '@prisma/client';

const app = createApp();

describe('ArtVest Collaboration Chat Test Suite', () => {
  let senderUser: { id: string; email: string };
  let recipientUser: { id: string; email: string };
  let thirdPartyUser: { id: string; email: string };
  let regularUser: { id: string; email: string };
  let creatorTargetUser: { id: string; email: string };
  let creatorProfileId: string;

  let senderCookie: string;
  let recipientCookie: string;
  let thirdPartyCookie: string;
  let regularUserCookie: string;
  let creatorTargetCookie: string;

  let pendingInquiryId: string;
  let acceptedInquiryId: string;
  let declinedInquiryId: string;
  let withdrawnInquiryId: string;
  const createdInquiryIds: string[] = [];

  before(async () => {
    // 1. Create test users
    const timestamp = Date.now();
    senderUser = await prisma.user.create({
      data: {
        email: `chat.sender.${timestamp}@example.com`,
        name: 'Chat Sender',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });

    recipientUser = await prisma.user.create({
      data: {
        email: `chat.recipient.${timestamp}@example.com`,
        name: 'Chat Recipient',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });

    thirdPartyUser = await prisma.user.create({
      data: {
        email: `chat.thirdparty.${timestamp}@example.com`,
        name: 'Chat Third Party',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: `chat.regular.${timestamp}@example.com`,
        name: 'Regular Community User',
        role: UserRole.USER,
        isOnboarded: true,
      },
    });

    creatorTargetUser = await prisma.user.create({
      data: {
        email: `chat.targetcreator.${timestamp}@example.com`,
        name: 'Target Creator User',
        role: UserRole.CREATOR,
        isOnboarded: true,
      },
    });

    const category = await prisma.category.findFirst();
    const targetProfile = await prisma.creatorProfile.create({
      data: {
        userId: creatorTargetUser.id,
        stageName: 'Target Creator',
        headline: 'Music Producer & Arranger',
        location: 'Bengaluru, India',
        primaryCategoryId: category!.id,
        isPublic: true,
      },
    });
    creatorProfileId = targetProfile.id;

    senderCookie = `artvest_session=${AuthService.generateSessionToken({
      userId: senderUser.id,
      email: senderUser.email,
      role: UserRole.CREATOR,
    })}`;

    recipientCookie = `artvest_session=${AuthService.generateSessionToken({
      userId: recipientUser.id,
      email: recipientUser.email,
      role: UserRole.CREATOR,
    })}`;

    thirdPartyCookie = `artvest_session=${AuthService.generateSessionToken({
      userId: thirdPartyUser.id,
      email: thirdPartyUser.email,
      role: UserRole.CREATOR,
    })}`;

    regularUserCookie = `artvest_session=${AuthService.generateSessionToken({
      userId: regularUser.id,
      email: regularUser.email,
      role: UserRole.USER,
    })}`;

    creatorTargetCookie = `artvest_session=${AuthService.generateSessionToken({
      userId: creatorTargetUser.id,
      email: creatorTargetUser.email,
      role: UserRole.CREATOR,
    })}`;

    recipientCookie = `artvest_session=${AuthService.generateSessionToken({
      userId: recipientUser.id,
      email: recipientUser.email,
      role: UserRole.CREATOR,
    })}`;

    thirdPartyCookie = `artvest_session=${AuthService.generateSessionToken({
      userId: thirdPartyUser.id,
      email: thirdPartyUser.email,
      role: UserRole.CREATOR,
    })}`;

    // 2. Create inquiries in different states
    const pendingInquiry = await prisma.collaborationInquiry.create({
      data: {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        message: 'Initial collaboration pitch for pending test',
        status: InquiryStatus.PENDING,
      },
    });
    pendingInquiryId = pendingInquiry.id;

    const acceptedInquiry = await prisma.collaborationInquiry.create({
      data: {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        message: 'Initial collaboration pitch for accepted test',
        status: InquiryStatus.ACCEPTED,
      },
    });
    acceptedInquiryId = acceptedInquiry.id;

    const declinedInquiry = await prisma.collaborationInquiry.create({
      data: {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        message: 'Initial collaboration pitch for declined test',
        status: InquiryStatus.DECLINED,
      },
    });
    declinedInquiryId = declinedInquiry.id;

    const withdrawnInquiry = await prisma.collaborationInquiry.create({
      data: {
        senderId: senderUser.id,
        recipientId: recipientUser.id,
        message: 'Initial collaboration pitch for withdrawn test',
        status: InquiryStatus.WITHDRAWN,
      },
    });
    withdrawnInquiryId = withdrawnInquiry.id;
  });

  after(async () => {
    // Cleanup created test records
    await prisma.notification.deleteMany({
      where: {
        recipientId: { in: [senderUser.id, recipientUser.id, thirdPartyUser.id, regularUser.id, creatorTargetUser.id] },
      },
    });
    await prisma.collaborationMessage.deleteMany({
      where: {
        inquiryId: { in: [pendingInquiryId, acceptedInquiryId, declinedInquiryId, withdrawnInquiryId, ...createdInquiryIds] },
      },
    });
    await prisma.collaborationInquiry.deleteMany({
      where: {
        id: { in: [pendingInquiryId, acceptedInquiryId, declinedInquiryId, withdrawnInquiryId, ...createdInquiryIds] },
      },
    });
    await prisma.creatorProfile.deleteMany({
      where: {
        userId: { in: [creatorTargetUser.id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [senderUser.id, recipientUser.id, thirdPartyUser.id, regularUser.id, creatorTargetUser.id] },
      },
    });
  });

  // 1. Authentication
  it('1. Rejects unauthenticated message access with 401', async () => {
    const getRes = await request(app).get(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`);
    assert.equal(getRes.status, 401);

    const postRes = await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .send({ content: 'Hello' });
    assert.equal(postRes.status, 401);
  });

  // 2. Non-existent inquiry
  it('2. Rejects operations on non-existent inquiry with 404', async () => {
    const res = await request(app)
      .get('/api/collaboration/inquiries/nonexistent-id/messages')
      .set('Cookie', [senderCookie]);
    assert.equal(res.status, 404);
  });

  // 3. Status Invariants (Must be ACCEPTED)
  it('3. Rejects chat access on PENDING inquiry with 403 COLLABORATION_NOT_ACCEPTED', async () => {
    const getRes = await request(app)
      .get(`/api/collaboration/inquiries/${pendingInquiryId}/messages`)
      .set('Cookie', [senderCookie]);
    assert.equal(getRes.status, 403);
    assert.equal(getRes.body.error?.code, 'COLLABORATION_NOT_ACCEPTED');

    const postRes = await request(app)
      .post(`/api/collaboration/inquiries/${pendingInquiryId}/messages`)
      .set('Cookie', [senderCookie])
      .send({ content: 'Trying to chat too early' });
    assert.equal(postRes.status, 403);
    assert.equal(postRes.body.error?.code, 'COLLABORATION_NOT_ACCEPTED');
  });

  it('4. Rejects chat access on DECLINED inquiry with 403 COLLABORATION_NOT_ACCEPTED', async () => {
    const res = await request(app)
      .get(`/api/collaboration/inquiries/${declinedInquiryId}/messages`)
      .set('Cookie', [senderCookie]);
    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'COLLABORATION_NOT_ACCEPTED');
  });

  it('5. Rejects chat access on WITHDRAWN inquiry with 403 COLLABORATION_NOT_ACCEPTED', async () => {
    const res = await request(app)
      .get(`/api/collaboration/inquiries/${withdrawnInquiryId}/messages`)
      .set('Cookie', [senderCookie]);
    assert.equal(res.status, 403);
    assert.equal(res.body.error?.code, 'COLLABORATION_NOT_ACCEPTED');
  });

  // 4. Participant Authorization (Must be sender or recipient)
  it('6. Rejects non-participant third party from reading or sending messages with 403', async () => {
    const getRes = await request(app)
      .get(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [thirdPartyCookie]);
    assert.equal(getRes.status, 403);
    assert.equal(getRes.body.error?.code, 'FORBIDDEN_INQUIRY_ACTION');

    const postRes = await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [thirdPartyCookie])
      .send({ content: 'Sneaking into collaboration chat' });
    assert.equal(postRes.status, 403);
    assert.equal(postRes.body.error?.code, 'FORBIDDEN_INQUIRY_ACTION');
  });

  // 5. Input Validation
  it('7. Rejects invalid or empty message payloads with 400 validation error', async () => {
    const emptyRes = await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [senderCookie])
      .send({ content: '   ' });
    assert.equal(emptyRes.status, 400);

    const longRes = await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [senderCookie])
      .send({ content: 'a'.repeat(2001) });
    assert.equal(longRes.status, 400);
  });

  // 6. Message Exchange & Chronological Ordering
  it('8. Sender and recipient can exchange messages on ACCEPTED inquiry', async () => {
    // Sender posts message 1
    const msg1Res = await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [senderCookie])
      .send({ content: 'Excited to collaborate! Let us schedule time.' });
    assert.equal(msg1Res.status, 201);
    assert.equal(msg1Res.body.success, true);
    assert.equal(msg1Res.body.data.content, 'Excited to collaborate! Let us schedule time.');
    assert.equal(msg1Res.body.data.senderId, senderUser.id);

    // Recipient replies with message 2
    const msg2Res = await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [recipientCookie])
      .send({ content: 'Sounds great! How does Thursday work for you?' });
    assert.equal(msg2Res.status, 201);
    assert.equal(msg2Res.body.data.senderId, recipientUser.id);

    // Both can fetch message history
    const fetchRes = await request(app)
      .get(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [senderCookie]);
    assert.equal(fetchRes.status, 200);
    assert.equal(fetchRes.body.success, true);
    assert.equal(fetchRes.body.data.inquiry.id, acceptedInquiryId);
    assert.equal(fetchRes.body.data.inquiry.message, 'Initial collaboration pitch for accepted test');
    assert.equal(fetchRes.body.data.messages.length, 2);
    assert.equal(fetchRes.body.data.messages[0].content, 'Excited to collaborate! Let us schedule time.');
    assert.equal(fetchRes.body.data.messages[1].content, 'Sounds great! How does Thursday work for you?');
  });

  // 7. Notification Debouncing
  it('9. Debounces message notifications to avoid notification spamming', async () => {
    // Clear notifications for recipient
    await prisma.notification.deleteMany({
      where: { recipientId: recipientUser.id, resourceId: acceptedInquiryId },
    });

    // Message A: creates new unread notification
    await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [senderCookie])
      .send({ content: 'Message A' });

    const notificationsAfterA = await prisma.notification.findMany({
      where: {
        recipientId: recipientUser.id,
        resourceId: acceptedInquiryId,
        type: NotificationType.COLLABORATION_MESSAGE_RECEIVED,
      },
    });
    assert.equal(notificationsAfterA.length, 1);
    assert.equal(notificationsAfterA[0].isRead, false);

    // Message B: while unread, debounces (updates existing, does not create second row)
    await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [senderCookie])
      .send({ content: 'Message B' });

    const notificationsAfterB = await prisma.notification.findMany({
      where: {
        recipientId: recipientUser.id,
        resourceId: acceptedInquiryId,
        type: NotificationType.COLLABORATION_MESSAGE_RECEIVED,
      },
    });
    assert.equal(notificationsAfterB.length, 1, 'Should debounce without creating duplicate unread notification');

    // Recipient marks notification as read
    await prisma.notification.update({
      where: { id: notificationsAfterB[0].id },
      data: { isRead: true },
    });

    // Message C: after reading, a new notification is generated
    await request(app)
      .post(`/api/collaboration/inquiries/${acceptedInquiryId}/messages`)
      .set('Cookie', [senderCookie])
      .send({ content: 'Message C' });

    const notificationsAfterC = await prisma.notification.findMany({
      where: {
        recipientId: recipientUser.id,
        resourceId: acceptedInquiryId,
        type: NotificationType.COLLABORATION_MESSAGE_RECEIVED,
      },
    });
    assert.equal(notificationsAfterC.length, 2, 'Should create fresh notification once previous notification is read');
  });

  // 8. Non-Creator Role Access & Duplicate Prevention
  it('10. Regular user (USER role) can send a collaboration inquiry to a creator', async () => {
    const res = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [regularUserCookie])
      .send({
        recipientId: creatorTargetUser.id,
        message: 'Hello, I would love to support and collaborate with your studio!',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.senderId, regularUser.id);
    assert.equal(res.body.data.recipientId, creatorTargetUser.id);
    assert.equal(res.body.data.status, 'PENDING');
    createdInquiryIds.push(res.body.data.id);
  });

  it('11. Rejects duplicate collaboration inquiry with 409 INQUIRY_ALREADY_EXISTS when PENDING exists', async () => {
    // Attempt from regularUser to creatorTargetUser
    const res1 = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [regularUserCookie])
      .send({
        recipientId: creatorTargetUser.id,
        message: 'Sending a second request while one is pending',
      });

    assert.equal(res1.status, 409);
    assert.equal(res1.body.error?.code, 'INQUIRY_ALREADY_EXISTS');

    // Also rejects reverse direction (creatorTargetUser to regularUser)
    const res2 = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [creatorTargetCookie])
      .send({
        recipientId: regularUser.id,
        message: 'Creator trying to send back while pending',
      });

    assert.equal(res2.status, 409);
    assert.equal(res2.body.error?.code, 'INQUIRY_ALREADY_EXISTS');
  });

  it('12. Rejects duplicate collaboration inquiry with 409 COLLABORATION_ALREADY_ACCEPTED when ACCEPTED exists', async () => {
    // In our test suite, acceptedInquiryId exists between senderUser and recipientUser
    const res = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [senderCookie])
      .send({
        recipientId: recipientUser.id,
        message: 'Attempting duplicate request when already accepted',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.error?.code, 'COLLABORATION_ALREADY_ACCEPTED');
  });

  it('13. Permits re-requesting collaboration if prior inquiry was DECLINED or WITHDRAWN', async () => {
    // Decline the pending inquiry from test 10
    const pendingId = createdInquiryIds[0];
    await prisma.collaborationInquiry.update({
      where: { id: pendingId },
      data: { status: InquiryStatus.DECLINED },
    });

    // regularUser sends a new request
    const res = await request(app)
      .post('/api/collaboration/inquiries')
      .set('Cookie', [regularUserCookie])
      .send({
        recipientId: creatorTargetUser.id,
        message: 'Following up with an updated project proposal!',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'PENDING');
    createdInquiryIds.push(res.body.data.id);
  });

  it('14. Regular user can list sent inquiries and chat on accepted inquiry', async () => {
    const latestInquiryId = createdInquiryIds[createdInquiryIds.length - 1];
    // Accept the inquiry
    await prisma.collaborationInquiry.update({
      where: { id: latestInquiryId },
      data: { status: InquiryStatus.ACCEPTED },
    });

    // 1. regularUser lists sent inquiries
    const listRes = await request(app)
      .get('/api/collaboration/inquiries/sent')
      .set('Cookie', [regularUserCookie]);

    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.success, true);
    assert.ok(Array.isArray(listRes.body.data), 'data should be an array of inquiries');
    const found = listRes.body.data.find((i: any) => i.id === latestInquiryId);
    assert.ok(found, 'Sent inquiry should appear in regular user sent list');
    assert.equal(found.status, 'ACCEPTED');

    // 2. regularUser sends message in chat
    const msgRes = await request(app)
      .post(`/api/collaboration/inquiries/${latestInquiryId}/messages`)
      .set('Cookie', [regularUserCookie])
      .send({ content: 'Hi! Thrilled our collaboration was accepted.' });

    assert.equal(msgRes.status, 201);
    assert.equal(msgRes.body.data.content, 'Hi! Thrilled our collaboration was accepted.');

    // 3. creator replies
    const replyRes = await request(app)
      .post(`/api/collaboration/inquiries/${latestInquiryId}/messages`)
      .set('Cookie', [creatorTargetCookie])
      .send({ content: 'Welcome aboard! Lets get started.' });

    assert.equal(replyRes.status, 201);

    // 4. regularUser reads chat history
    const historyRes = await request(app)
      .get(`/api/collaboration/inquiries/${latestInquiryId}/messages`)
      .set('Cookie', [regularUserCookie]);

    assert.equal(historyRes.status, 200);
    assert.equal(historyRes.body.data.messages.length, 2);
  });

  it('15. GET /api/creators/:creatorId returns collaborationInquiry for authenticated requester', async () => {
    // Authenticated request by regularUser
    const authRes = await request(app)
      .get(`/api/creators/${creatorProfileId}`)
      .set('Cookie', [regularUserCookie]);

    assert.equal(authRes.status, 200);
    assert.equal(authRes.body.success, true);
    assert.ok(authRes.body.data.collaborationInquiry, 'collaborationInquiry should be present for logged-in user');
    assert.equal(authRes.body.data.collaborationInquiry.status, 'ACCEPTED');
    assert.equal(authRes.body.data.collaborationInquiry.senderId, regularUser.id);
    assert.equal(authRes.body.data.collaborationInquiry.recipientId, creatorTargetUser.id);

    // Unauthenticated request should have null collaborationInquiry
    const unauthRes = await request(app).get(`/api/creators/${creatorProfileId}`);
    assert.equal(unauthRes.status, 200);
    assert.equal(unauthRes.body.data.collaborationInquiry, null);
  });
});
