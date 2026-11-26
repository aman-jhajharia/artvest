import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { ProjectService } from '../src/services/project.service.js';
import { UserRole, ProjectStatus, CreditTransactionType, InvestmentStatus } from '@prisma/client';

const app = createApp();

describe('ArtCredits & Fractional Project Backing (IPO Escrow Hold Model) Test Suite', () => {
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
  let cancelProjectId: string;
  let expiredProjectId: string;
  let sweepProjectId: string;

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
        heldBalance: 0,
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
        heldBalance: 0,
      },
    });
    regularUserId = regUser.id;

    regularUserToken = AuthService.generateSessionToken({
      userId: regularUserId,
      email: regUser.email,
      role: UserRole.USER,
    });
    regularUserCookie = `artvest_session=${regularUserToken}`;

    // 4. Create Regular User 2
    const secondUser = await prisma.user.create({
      data: {
        email: `credits.backer2.${Date.now()}@example.com`,
        name: 'Backer Sarah',
        role: UserRole.USER,
        isOnboarded: true,
        creditBalance: 10000,
        heldBalance: 0,
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

  after(async () => {
    // Clean up test data
    try {
      const pIds = [testProjectId, cancelProjectId, expiredProjectId, sweepProjectId].filter(Boolean);
      if (pIds.length > 0) {
        await prisma.projectInvestment.deleteMany({ where: { projectId: { in: pIds } } });
        await prisma.creativeProject.deleteMany({ where: { id: { in: pIds } } });
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
  it('assigns 10,000 demo ArtCredits, heldBalance: 0, and logs SIGNUP_BONUS on new user registration', async () => {
    const mockEmail = `newbie.${Date.now()}@artvest.test`;
    const authRes = await AuthService.authenticateGoogleUser(
      `mock_test_credential:{"googleId":"google_mock_${Date.now()}","email":"${mockEmail}","name":"Newbie Investor"}`
    );

    assert.equal(authRes.user.creditBalance, 10000);
    assert.equal(authRes.user.heldBalance, 0);

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
        deadline: new Date(Date.now() + 86400000).toISOString(),
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
        deadline: new Date(Date.now() + 86400000).toISOString(),
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
        deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
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

  // 5. Rejection of investment exceeding spendable user balance
  it('rejects investment if user has insufficient available credits (HTTP 400 INSUFFICIENT_CREDITS)', async () => {
    // Temporarily reduce regularUser available balance to 500 AC
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

  // 6. IPO-style Blocked Amount / Escrow Hold on Pledge
  it('places pledged credits on hold (creditBalance -> heldBalance) with status: HELD and logs INVESTMENT_HOLD', async () => {
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
    assert.equal(res.body.data.investment.status, 'HELD');
    assert.equal(res.body.data.project.amountRaised, 2000);
    assert.equal(res.body.data.project.status, 'OPEN');

    // Verify investor balance: Available dropped by 2,000, Held increased by 2,000 (Total = 10,000)
    const investor = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(investor?.creditBalance, 8000, 'Available balance should be 8,000 AC');
    assert.equal(investor?.heldBalance, 2000, 'Held escrow balance should be 2,000 AC');

    // Verify creator balance has NOT received funds prematurely
    const creator = await prisma.user.findUnique({ where: { id: creatorUserId } });
    assert.equal(creator?.creditBalance, 10000, 'Creator should not receive funds before 100% funding');

    // Verify credit transaction logged as INVESTMENT_HOLD
    const tx = await prisma.creditTransaction.findFirst({
      where: {
        userId: regularUserId,
        type: CreditTransactionType.INVESTMENT_HOLD,
        referenceId: testProjectId,
      },
    });
    assert.ok(tx, 'INVESTMENT_HOLD transaction should be logged');
    assert.equal(tx.amount, -2000);
    assert.equal(tx.balanceAfter, 8000);
  });

  // 7. Double-spend protection with held funds
  it('prevents spending held funds elsewhere (user with 8,000 available cannot spend 8,500)', async () => {
    // Create a project with a large goal (10,000 AC) so oversubscription is not triggered
    const bigProj = await prisma.creativeProject.create({
      data: {
        creatorId: creatorUserId,
        title: 'Big Goal Project',
        description: 'Testing available spendable balance check',
        fundingGoal: 10000,
        categoryId,
      },
    });

    const res = await request(app)
      .post(`/api/projects/${bigProj.id}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 8500 }); // Available is 8,000 even though total is 10,000

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INSUFFICIENT_CREDITS');

    await prisma.creativeProject.delete({ where: { id: bigProj.id } });
  });

  // 8. Oversubscription guard
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

  // 9. Cumulative pledge on hold
  it('correctly updates cumulative pledge on hold when same backer pledges again', async () => {
    // regularUser pledges another 1,000 AC -> total 3,000 AC out of 5,000 (60.00% -> 6,000 shares)
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 1000 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.investment.creditsInvested, 3000);
    assert.equal(res.body.data.investment.sharesAcquired, 6000);
    assert.equal(res.body.data.investment.sharePercentage, 60.0);
    assert.equal(res.body.data.investment.status, 'HELD');
    assert.equal(res.body.data.project.amountRaised, 3000);
    assert.equal(res.body.data.project.status, 'OPEN');

    const investor = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(investor?.creditBalance, 7000);
    assert.equal(investor?.heldBalance, 3000);
  });

  // 10. Multi-Backer Atomic IPO Settlement at 100% Allotment
  it('atomically settles all held pledges, finalizes debits, allotts shares, and credits creator at 100% funding', async () => {
    // Remaining gap = 2,000 AC. secondUser pledges 2,000 AC
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
    assert.equal(res.body.data.project.sharesAllocated, 10000);

    // 1. Backer 1 check: held balance should now be 0 (finalized debit)
    const backer1 = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(backer1?.heldBalance, 0, 'Backer 1 heldBalance should be 0 after settlement');
    assert.equal(backer1?.creditBalance, 7000, 'Backer 1 creditBalance remains at 7,000');

    // Backer 1 investment status should now be ALLOTTED
    const inv1 = await prisma.projectInvestment.findUnique({
      where: { projectId_investorId: { projectId: testProjectId, investorId: regularUserId } },
    });
    assert.equal(inv1?.status, InvestmentStatus.ALLOTTED);

    // 2. Backer 2 check: held balance should now be 0 (finalized debit)
    const backer2 = await prisma.user.findUnique({ where: { id: secondUserId } });
    assert.equal(backer2?.heldBalance, 0, 'Backer 2 heldBalance should be 0 after settlement');
    assert.equal(backer2?.creditBalance, 8000, 'Backer 2 creditBalance should be 8,000');

    const inv2 = await prisma.projectInvestment.findUnique({
      where: { projectId_investorId: { projectId: testProjectId, investorId: secondUserId } },
    });
    assert.equal(inv2?.status, InvestmentStatus.ALLOTTED);

    // 3. Creator check: credited with full fundingGoal (5,000 AC)
    const creatorAfter = await prisma.user.findUnique({ where: { id: creatorUserId } });
    assert.equal(creatorAfter?.creditBalance, initialCreatorBalance + 5000);

    // 4. Verify INVESTMENT_SETTLED logged for both backers
    const settledTxs = await prisma.creditTransaction.findMany({
      where: {
        referenceId: testProjectId,
        type: CreditTransactionType.INVESTMENT_SETTLED,
      },
    });
    assert.equal(settledTxs.length, 2, 'Both backers should receive INVESTMENT_SETTLED transaction records');

    // 5. Verify creator notification
    const notif = await prisma.notification.findFirst({
      where: {
        recipientId: creatorUserId,
        type: 'PROJECT_FUNDED',
        resourceId: testProjectId,
      },
    });
    assert.ok(notif, 'Creator should receive PROJECT_FUNDED notification');
  });

  // 11. Rejection of investment in already FUNDED project
  it('rejects investment once project is FUNDED (HTTP 400 PROJECT_NOT_OPEN)', async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 500 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'PROJECT_NOT_OPEN');
  });

  // 12. Project Cancellation and Full Hold Release
  it('allows creator to cancel an OPEN project and releases all backer holds with zero loss', async () => {
    // 1. Create a second open project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Cancel Test Pitch',
        description: 'Testing hold release on pitch cancellation.',
        fundingGoal: 5000,
        categoryId,
        deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
      });

    assert.equal(projRes.status, 201);
    cancelProjectId = projRes.body.data.id;

    // 2. Backer 1 pledges 1,500 AC on hold
    const b1Before = await prisma.user.findUnique({ where: { id: regularUserId } });
    const b1AvailBefore = b1Before!.creditBalance; // 7,000

    await request(app)
      .post(`/api/projects/${cancelProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 1500 });

    const b1During = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(b1During?.creditBalance, b1AvailBefore - 1500);
    assert.equal(b1During?.heldBalance, 1500);

    // 3. Backer 2 pledges 1,000 AC on hold
    await request(app)
      .post(`/api/projects/${cancelProjectId}/invest`)
      .set('Cookie', secondUserCookie)
      .send({ amount: 1000 });

    // 4. Non-creator cannot cancel (403)
    const unauthCancel = await request(app)
      .post(`/api/projects/${cancelProjectId}/cancel`)
      .set('Cookie', regularUserCookie)
      .send();
    assert.equal(unauthCancel.status, 403);

    // 5. Creator cancels project
    const cancelRes = await request(app)
      .post(`/api/projects/${cancelProjectId}/cancel`)
      .set('Cookie', creatorCookie)
      .send();

    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.body.data.project.status, 'CANCELLED');
    assert.equal(cancelRes.body.data.releasedBackersCount, 2);

    // 6. Verify Backer 1 hold was released back to spendable creditBalance
    const b1After = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(b1After?.heldBalance, 0, 'Backer 1 heldBalance should return to 0');
    assert.equal(b1After?.creditBalance, b1AvailBefore, 'Backer 1 creditBalance should be restored in full');

    // 7. Verify Backer 2 hold was released
    const b2After = await prisma.user.findUnique({ where: { id: secondUserId } });
    assert.equal(b2After?.heldBalance, 0);
    assert.equal(b2After?.creditBalance, 8000);

    // 8. Verify investment records marked RELEASED
    const releasedInvs = await prisma.projectInvestment.findMany({
      where: { projectId: cancelProjectId },
    });
    assert.equal(releasedInvs.length, 2);
    assert.ok(releasedInvs.every((inv) => inv.status === InvestmentStatus.RELEASED));

    // 9. Verify INVESTMENT_RELEASED transactions logged
    const releasedTxs = await prisma.creditTransaction.findMany({
      where: {
        referenceId: cancelProjectId,
        type: CreditTransactionType.INVESTMENT_RELEASED,
      },
    });
    assert.equal(releasedTxs.length, 2);
  });

  // 13. Demo faucet (+5,000 AC)
  it('grants demo faucet topup (+5,000 AC) and updates balance', async () => {
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
  });

  // 14. Cap Table & Project Details with Status
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
    assert.equal(res.body.data.capTable[0].status, 'ALLOTTED');
  });

  // 15. Wallet breakdown (available, held, total) via GET /api/wallet
  it('returns available balance, held balance, total balance, and portfolio via GET /api/wallet', async () => {
    const res = await request(app)
      .get('/api/wallet')
      .set('Cookie', regularUserCookie);

    assert.equal(res.status, 200);
    assert.ok(typeof res.body.data.creditBalance === 'number');
    assert.ok(typeof res.body.data.heldBalance === 'number');
    assert.equal(
      res.body.data.totalBalance,
      res.body.data.creditBalance + res.body.data.heldBalance
    );
    assert.ok(res.body.data.portfolio.length >= 1);
    assert.ok(res.body.data.portfolio[0].status);
  });

  // 16. Rejection of past deadline on project creation
  it('rejects project creation if funding deadline is in the past (HTTP 400)', async () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', creatorCookie)
      .send({
        title: 'Past Deadline Pitch',
        description: 'Should fail validation due to past deadline.',
        fundingGoal: 5000,
        categoryId,
        deadline: pastDate,
      });

    assert.equal(res.status, 400);
  });

  // 17. Rejection of investment when deadline has passed
  it('blocks investment after deadline has passed (HTTP 400 PROJECT_DEADLINE_EXPIRED)', async () => {
    // Create an open project with an already passed deadline directly
    const expiredProject = await prisma.creativeProject.create({
      data: {
        creatorId: creatorUserId,
        title: 'Expired Deadline Pitch',
        description: 'Testing investment rejection on expired project.',
        fundingGoal: 5000,
        totalShares: 10000,
        categoryId,
        deadline: new Date(Date.now() - 60000), // 1 minute ago
        status: ProjectStatus.OPEN,
      },
    });
    expiredProjectId = expiredProject.id;

    const res = await request(app)
      .post(`/api/projects/${expiredProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 500 });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'PROJECT_DEADLINE_EXPIRED');

    // Confirm that project has been transitioned to CANCELLED by the on-access expiry
    const checkProject = await prisma.creativeProject.findUnique({ where: { id: expiredProjectId } });
    assert.equal(checkProject?.status, ProjectStatus.CANCELLED);
  });

  // 18. Automatic escrow refund & notifications on periodic / on-access sweep
  it('automatically cancels expired unfunded project, refunds held balances, and notifies backers + creator', async () => {
    // 1. Create a project with future deadline
    const sweepProject = await prisma.creativeProject.create({
      data: {
        creatorId: creatorUserId,
        title: 'Auto Sweep EP',
        description: 'Testing automatic escrow refund upon deadline sweep.',
        fundingGoal: 5000,
        totalShares: 10000,
        categoryId,
        deadline: new Date(Date.now() + 3600000), // 1 hour in future
        status: ProjectStatus.OPEN,
      },
    });
    sweepProjectId = sweepProject.id;

    // 2. Backer 1 pledges 1,500 AC
    const b1Start = await prisma.user.findUnique({ where: { id: regularUserId } });
    const b1StartBal = b1Start!.creditBalance;

    await request(app)
      .post(`/api/projects/${sweepProjectId}/invest`)
      .set('Cookie', regularUserCookie)
      .send({ amount: 1500 });

    // 3. Backer 2 pledges 1,000 AC
    const b2Start = await prisma.user.findUnique({ where: { id: secondUserId } });
    const b2StartBal = b2Start!.creditBalance;

    await request(app)
      .post(`/api/projects/${sweepProjectId}/invest`)
      .set('Cookie', secondUserCookie)
      .send({ amount: 1000 });

    // Verify both are held
    const b1Held = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(b1Held?.heldBalance, 1500);
    assert.equal(b1Held?.creditBalance, b1StartBal - 1500);

    const b2Held = await prisma.user.findUnique({ where: { id: secondUserId } });
    assert.equal(b2Held?.heldBalance, 1000);
    assert.equal(b2Held?.creditBalance, b2StartBal - 1000);

    // 4. Force deadline into past (simulate passage of time)
    await prisma.creativeProject.update({
      where: { id: sweepProjectId },
      data: { deadline: new Date(Date.now() - 10000) },
    });

    // 5. Trigger sweep (Layer 1 or Layer 2 sweep)
    const sweepResults = await ProjectService.sweepExpiredProjects();
    assert.ok(sweepResults.length >= 1);

    // 6. Verify Project is CANCELLED
    const sweptProj = await prisma.creativeProject.findUnique({ where: { id: sweepProjectId } });
    assert.equal(sweptProj?.status, ProjectStatus.CANCELLED);

    // 7. Verify Backer 1 refund
    const b1Refunded = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(b1Refunded?.heldBalance, 0);
    assert.equal(b1Refunded?.creditBalance, b1StartBal);

    // 8. Verify Backer 2 refund
    const b2Refunded = await prisma.user.findUnique({ where: { id: secondUserId } });
    assert.equal(b2Refunded?.heldBalance, 0);
    assert.equal(b2Refunded?.creditBalance, b2StartBal);

    // 9. Verify investment records marked RELEASED
    const investments = await prisma.projectInvestment.findMany({ where: { projectId: sweepProjectId } });
    assert.equal(investments.length, 2);
    assert.equal(investments[0].status, InvestmentStatus.RELEASED);
    assert.equal(investments[1].status, InvestmentStatus.RELEASED);

    // 10. Verify audit ledger entries
    const txRecords = await prisma.creditTransaction.findMany({
      where: { referenceId: sweepProjectId, type: CreditTransactionType.INVESTMENT_RELEASED },
    });
    assert.equal(txRecords.length, 2);

    // 11. Verify notifications for backers and creator
    const notifs = await prisma.notification.findMany({
      where: { resourceId: sweepProjectId },
    });
    assert.ok(notifs.length >= 3); // 2 backers + 1 creator
  });

  // 19. Concurrency & Idempotency check for expiration
  it('ensures running expireUnfundedProject multiple times is strictly idempotent', async () => {
    // Calling expireUnfundedProject on an already CANCELLED/expired project
    const rerun = await ProjectService.expireUnfundedProject(sweepProjectId);
    assert.equal(rerun.expired, false);

    // Backer balances must remain intact
    const b1Check = await prisma.user.findUnique({ where: { id: regularUserId } });
    assert.equal(b1Check?.heldBalance, 0);
  });
});
