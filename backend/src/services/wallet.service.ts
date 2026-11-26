import { prisma } from '../config/database.js';
import { AppError } from '../utils/apiResponse.js';
import { ProjectService } from './project.service.js';

export class WalletService {
  /**
   * Retrieves user's live demo ArtCredit balance (available, held in escrow, and total),
   * investment portfolio with share percentages and hold/allotment status, and audit ledger.
   */
  public static async getWallet(userId: string) {
    // Layer 1: Lazy sweep of any expired open pitches
    await ProjectService.sweepExpiredProjects();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        creditBalance: true,
        heldBalance: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const [investments, transactions] = await Promise.all([
      prisma.projectInvestment.findMany({
        where: { investorId: userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
              fundingGoal: true,
              amountRaised: true,
              totalShares: true,
              coverMediaUrl: true,
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              creator: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const totalInvestedCredits = investments.reduce(
      (sum, inv) => sum + inv.creditsInvested,
      0
    );

    const portfolio = investments.map((inv) => ({
      investmentId: inv.id,
      projectId: inv.projectId,
      projectTitle: inv.project.title,
      projectStatus: inv.project.status,
      status: inv.status, // HELD, ALLOTTED, RELEASED
      coverMediaUrl: inv.project.coverMediaUrl,
      category: inv.project.category,
      creator: inv.project.creator,
      creditsInvested: inv.creditsInvested,
      sharesAcquired: inv.sharesAcquired,
      sharePercentage: inv.sharePercentage,
      fundingProgressPercentage: Number(
        ((inv.project.amountRaised / inv.project.fundingGoal) * 100).toFixed(2)
      ),
      updatedAt: inv.updatedAt,
    }));

    return {
      creditBalance: user.creditBalance,
      heldBalance: user.heldBalance,
      totalBalance: user.creditBalance + user.heldBalance,
      totalInvestedCredits,
      activeHoldingsCount: portfolio.length,
      portfolio,
      transactions,
    };
  }

  /**
   * Claim free demo ArtCredits faucet (+5,000 AC).
   */
  public static async claimDemoTopup(userId: string) {
    const topupAmount = 5000;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, creditBalance: true, heldBalance: true },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { increment: topupAmount } },
      });

      const txRecord = await tx.creditTransaction.create({
        data: {
          userId,
          amount: topupAmount,
          balanceAfter: updated.creditBalance,
          type: 'DEMO_TOPUP',
          description: 'Demo faucet grant: +5,000 virtual ArtCredits',
        },
      });

      return {
        newBalance: updated.creditBalance,
        heldBalance: updated.heldBalance,
        totalBalance: updated.creditBalance + updated.heldBalance,
        amountAdded: topupAmount,
        transaction: txRecord,
      };
    });

    return result;
  }
}
