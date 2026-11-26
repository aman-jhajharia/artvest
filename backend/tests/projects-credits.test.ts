import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { UserRole, ProjectStatus, CreditTransactionType } from '@prisma/client';

const app = createApp();

describe('ArtCredits & Fractional Project Backing Test Suite', () => {
  let creatorToken: string;
  let creatorCookie: string;
  let creatorUserId: string;

  let regularUserToken: string;
  let regularUserCookie: string;
  let regularUserId: string;

  let secondUserToken: string;
  let secondUserCookie: string;
  let secondUserId: string;

  let categoryId: string;
  let testProjectId: string;

  before(async () => {
    // 1. Ensure a category exists
    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: 'Music & Audio',
          slug: `music-${Date.now()}`,
        },
      });
    }
    categoryId = cat.id;

    // 2. Create Creator User
    const creatorUser = await prisma.user.create({
      data: {
        email: `credits.creator.${Date.now()}@example.com`,
        name: 'Producer Maya',
        role: UserRole.CREATOR,
        isOnboarded: true,
        creditBalance: 10000,
      },
    });
    creatorUserId = creatorUser.id;

    await prisma.creatorProfile.create({
      data: {
        userId: creatorUserId,
        stageName: 'Maya Beats',
        location: 'Mumbai, India',
        primaryCategoryId: categoryId,
        isPublic: true,
      },
    });

    creatorToken = AuthService.generateSessionToken({
      userId: creatorUserId,
      email: creatorUser.email,
      role: UserRole.CREATOR,
    });
    creatorCookie = `artvest_session=${creatorToken}`;

    // 3. Create Regular User 1
    const regUser = await prisma.user.create({
      data: {
        email: `credits.backer.${Date.now()}@example.com`,
        name: 'Backer Dev',
        role: UserRole.USER,
        isOnboarded: true,
        creditBalance: 10000,
      },
    });
    regularUserId = regUser.id;

    regularToken = AuthService.generateSessionToken({
      userId: regularUserId,
      email: regUser.email,
      role: UserRole.USER,
    });
    regularUserCookie = `artvest_session=${regularToken}`;

    // 4. Create Regular User 2
    const secondUser = await prisma.user.create({
      data: {
        email: `credits.backer2.${Date.now()}@example.com`,
        name: 'Backer Sarah',
        role: UserRole.USER,
        isOnboarded: true,
        creditBalance: 10000,
      },
    });
    secondUserId = secondUser.id;

    secondUserToken = AuthService.generateSessionToken({
      userId: secondUserId,
      email: secondUser.email,
      role: UserRole.USER,
    });
    secondUserCookie = `artvest_session=${secondUserToken}`;
  });

  let regularToken: string;

  after(async () => {
    // Clean up test data
    try {
      if (testProjectId) {
        await prisma.projectInvestment.deleteMany({ where: { projectId: testProjectId } });
        await prisma.creativeProject.delete({ where: { id: testProjectId } });
      }
      await prisma.creditTransaction.deleteMany({
        where: { userId: { in: [creatorUserId, regularUserId, secondUserId] } },
      });
      await prisma.creatorProfile.deleteMany({ where: { userId: creatorUserId } });
      await prisma.user.deleteMany({
        where: { id: { in: [creatorUserId, regularUserId, secondUserId] } },
      });
    } catch {
      // Best effort cleanup
    }
  });

  // 1. Signup bonus check
  it('assigns 10,000 demo ArtCredits and logs SIGNUP_BONUS on new user registration', async () => {
    const mockEmail = `newbie.${Date.now()}@artvest.test`;
    const authRes = await AuthService.authenticateGoogleUser(
      `mock_test_credential:{"googleId":"google_mock_${Date.now()}","email":"${mockEmail}","name":"Newbie Investor"}`
    );

    assert.equal(authRes.user.creditBalance, 10000);

    const tx = await prisma.creditTransaction.findFirst({
      where: {
        userId: authRes.user.id,
        type: CreditTransactionType.SIGNUP_BONUS,
      },
    });

    assert.ok(tx, 'Signup bonus transaction should be recorded');
    assert.equal(tx.amount, 10000);
    assert.equal(tx.balanceAfter, 10000);

    // Clean up
    await prisma.creditTransaction.deleteMany({ where: { userId: authRes.user.id } });
    await prisma.user.delete({ where: { id: authRes.user.id } });
  });

  // 2. Creator Project Launch & 500-multiple validation
  it('rejects project creation if user is not a CREATOR (HTTP 403)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', regularUserCookie)
      .send({
        title: 'Unauthorized Project',
        description: 'Trying to create without creator role',
        fundingGoal: 5000,
      });

    assert.equal(res.status, 403);
  });

  it('rejects project creation if fundingGoal is not a multiple of 500 (HTTP 400)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Odd Goal Project',
        description: 'Funding goal not divisible by 500',
        fundingGoal: 750,
      });

    assert.equal(res.status, 400);
  });

  it('allows CREATOR to launch a valid creative project with goal in multiples of 500', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Sufi Electronic Odyssey',
        description: 'An experimental synth and Sufi vocal fusion album recorded in Rajasthan.',
        fundingGoal: 5000,
        totalShares: 10000,
        categoryId,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.fundingGoal, 5000);
    assert.equal(res.body.data.amountRaised, 0);
    assert.equal(res.body.data.status, 'OPEN');

    testProjectId = res.body.data.id;
  });

  // 3. Investment validation: Multiples of 500 only
  it('rejects investment if amount is not a multiple of 500 (e.g. 250 AC) with 400 INVALID_INVESTMENT_INCREMENT', async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 250 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INVALID_INVESTMENT_INCREMENT');
  });

  // 4. Rejection of self-investment
  it('rejects creator self-investment in own project (HTTP 400 CANNOT_INVEST_IN_OWN_PROJECT)', async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', creatorCookie)
      .send({ amount: 1000 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'CANNOT_INVEST_IN_OWN_PROJECT');
  });

  // 5. Rejection of investment exceeding user balance
  it('rejects investment if user has insufficient credits (HTTP 400 INSUFFICIENT_CREDITS)', async () => {
    // Temporarily reduce regularUser balance to 500 AC, then try to invest 1,000 AC (within remaining 5,000 goal)
    await prisma.user.update({
      where: { id: regularUserId },
      data: { creditBalance: 500 },
    });

    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 1000 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INSUFFICIENT_CREDITS');

    // Restore balance for next tests
    await prisma.user.update({
      where: { id: regularUserId },
      data: { creditBalance: 10000 },
    });
  });

  // 6. Valid fractional investment & math precision
  it('successfully executes fractional investment with exact share allocation', async () => {
    // Invest 2,000 AC out of 5,000 AC goal (40.00% equity -> 4,000 shares)
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 2000 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.investment.creditsInvested, 2000);
    assert.equal(res.body.data.investment.sharesAcquired, 4000);
    assert.equal(res.body.data.investment.sharePercentage, 40.0);
    assert.equal(res.body.data.project.amountRaised, 2000);
    assert.equal(res.body.data.project.status, 'OPEN');

    // Verify investor balance was debited
    const investor = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(investor?.creditBalance, 8000);

    // Verify credit transaction logged
    const tx = await prisma.creditTransaction.findFirst({
      where: {
        userId: regularUserId,
        type: CreditTransactionType.PROJECT_INVESTMENT,
        referenceId: testProjectId,
      },
    });
    assert.ok(tx);
    assert.equal(tx.amount, -2000);
    assert.equal(tx.balanceAfter, 8000);
  });

  // 7. Oversubscription guard
  it('rejects investment that exceeds the remaining funding gap (HTTP 400 OVERSUBSCRIPTION_ERROR)', async () => {
    // Current raised: 2000 / 5000 (remaining gap = 3000)
    // Attempting to invest 3,500 should be rejected
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', secondUserCookie)
      .send({ amount: 3500 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'OVERSUBSCRIPTION_ERROR');
  });

  // 8. Cumulative investment by the same investor
  it('correctly updates cumulative investment and shares when same backer invests again', async () => {
    // regularUser invests another 1,000 AC -> total 3,000 AC out of 5,000 (60.00% -> 6,000 shares)
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 1000 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.investment.creditsInvested, 3000);
    assert.equal(res.body.data.investment.sharesAcquired, 6000);
    assert.equal(res.body.data.investment.sharePercentage, 60.0);
    assert.equal(res.body.data.project.amountRaised, 3000);
    assert.equal(res.body.data.project.status, 'OPEN');
  });

  // 9. Auto-transition to FUNDED and Creator Payout
  it('automatically transitions project to FUNDED and pays out creator when goal is met', async () => {
    // Remaining gap = 2,000 AC. secondUser invests 2,000 AC
    const creatorBefore = await prisma.user.findUnique({ where: { id: creatorUserId } });
    const initialCreatorBalance = creatorBefore?.creditBalance || 0;

    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', secondUserCookie)
      .send({ amount: 2000 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.isNowFunded, true);
    assert.equal(res.body.data.project.status, 'FUNDED');
    assert.equal(res.body.data.project.amountRaised, 5000);
    assert.equal(res.body.data.project.sharesAllocated, 10000); // 100% total shares allocated

    // Check creator was credited fundingGoal (5,000 AC)
    const creatorAfter = await prisma.user.findUnique({ where: { id: creatorUserId } });
    assert.equal(creatorAfter?.creditBalance, initialCreatorBalance + 5000);

    // Check creator funding received transaction logged
    const creatorTx = await prisma.creditTransaction.findFirst({
      where: {
        userId: creatorUserId,
        type: CreditTransactionType.PROJECT_FUNDING_RECEIVED,
        referenceId: testProjectId,
      },
    });
    assert.ok(creatorTx);
    assert.equal(creatorTx.amount, 5000);

    // Check creator notification
    const notif = await prisma.notification.findFirst({
      where: {
        recipientId: creatorUserId,
        type: 'PROJECT_FUNDED',
        resourceId: testProjectId,
      },
    });
    assert.ok(notif, 'Creator should receive PROJECT_FUNDED notification');
  });

  // 10. Rejection of investment in already FUNDED project
  it('rejects investment once project is FUNDED (HTTP 400 PROJECT_NOT_OPEN)', async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 500 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'PROJECT_NOT_OPEN');
  });

  // 11. Demo faucet (+5,000 AC)
  it('grants demo faucet topup (+5,000 AC) and records audit trail', async () => {
    const userBefore = await prisma.user.findUnique({ where: { id: regularUserId } });
    const balanceBefore = userBefore?.creditBalance || 0;

    const res = await request(app)
      .post('/api/wallet/demo-topup')
      .set('Cookie', regularUserCookie)
      .send();

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amountAdded, 5000);
    assert.equal(res.body.data.newBalance, balanceBefore + 5000);

    const tx = await prisma.creditTransaction.findFirst({
      where: {
        userId: regularUserId,
        type: CreditTransactionType.DEMO_TOPUP,
      },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(tx);
    assert.equal(tx.amount, 5000);
  });

  // 12. Cap Table and Portfolio accuracy
  it('returns accurate shareholder cap table via GET /api/projects/:id', async () => {
    const res = await request(app)
      .get(`/api/projects/${testProjectId}`)
      .set('Cookie', regularUserCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'FUNDED');
    assert.equal(res.body.data.fundingProgressPercentage, 100);
    assert.equal(res.body.data.backersCount, 2);
    assert.ok(Array.isArray(res.body.data.capTable));
    assert.equal(res.body.data.capTable.length, 2);

    // Check caller's investment is included
    assert.equal(res.body.data.currentUserInvestment.creditsInvested, 3000);
    assert.equal(res.body.data.currentUserInvestment.sharesAcquired, 6000);
    assert.equal(res.body.data.currentUserInvestment.sharePercentage, 60.0);
  });

  it('returns accurate portfolio holdings and transactions via GET /api/wallet', async () => {
    const res = await request(app)
      .get('/api/wallet')
      .set('Cookie', regularUserCookie);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.creditBalance > 0);
    assert.equal(res.body.data.totalInvestedCredits, 3000);
    assert.equal(res.body.data.portfolio.length, 1);
    assert.equal(res.body.data.portfolio[0].projectId, testProjectId);
    assert.equal(res.body.data.portfolio[0].sharesAcquired, 6000);
    assert.equal(res.body.data.portfolio[0].sharePercentage, 60.0);
    assert.ok(res.body.data.transactions.length >= 2);
  });
});
