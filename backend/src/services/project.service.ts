import { prisma } from '../config/database.js';
import { ProjectStatus, NotificationType, InvestmentStatus, CreditTransactionType } from '@prisma/client';
import { AppError } from '../utils/apiResponse.js';
import { NotificationService } from './notification.service.js';
import { CreateProjectInput, ProjectQuery } from '../validators/project.validator.js';

export class ProjectService {
  /**
   * List active/funded projects with filters, progress %, and caller's holding.
   */
  public static async listProjects(query: ProjectQuery, currentUserId?: string) {
    const { status, category, search, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.creativeProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              creatorProfile: {
                select: {
                  stageName: true,
                  headline: true,
                  location: true,
                },
              },
            },
          },
          _count: {
            select: {
              investments: true,
            },
          },
          investments: currentUserId
            ? {
                where: { investorId: currentUserId },
                select: {
                  creditsInvested: true,
                  sharesAcquired: true,
                  sharePercentage: true,
                  status: true,
                },
              }
            : false,
        },
      }),
      prisma.creativeProject.count({ where }),
    ]);

    const enriched = projects.map((p) => {
      const progressPercent = Number(((p.amountRaised / p.fundingGoal) * 100).toFixed(2));
      const remainingGap = Math.max(0, p.fundingGoal - p.amountRaised);
      const sharePrice = Number((p.fundingGoal / p.totalShares).toFixed(2));
      const userInv = Array.isArray(p.investments) && p.investments.length > 0 ? p.investments[0] : null;

      const { investments, _count, ...rest } = p;
      return {
        ...rest,
        backersCount: _count.investments,
        fundingProgressPercentage: progressPercent,
        remainingGap,
        sharePrice,
        currentUserInvestment: userInv,
      };
    });

    return {
      projects: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get project details with creator profile, live cap table, and caller's holding.
   */
  public static async getProjectById(projectId: string, currentUserId?: string) {
    const project = await prisma.creativeProject.findUnique({
      where: { id: projectId },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            creatorProfile: {
              select: {
                stageName: true,
                headline: true,
                location: true,
                isVerified: true,
              },
            },
          },
        },
        investments: {
          orderBy: { creditsInvested: 'desc' },
          take: 50,
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    const progressPercent = Number(((project.amountRaised / project.fundingGoal) * 100).toFixed(2));
    const remainingGap = Math.max(0, project.fundingGoal - project.amountRaised);
    const sharePrice = Number((project.fundingGoal / project.totalShares).toFixed(2));

    const currentUserHolding = currentUserId
      ? project.investments.find((inv) => inv.investorId === currentUserId) || null
      : null;

    const capTable = project.investments.map((inv) => ({
      investorId: inv.investorId,
      name: inv.investor.name,
      avatarUrl: inv.investor.avatarUrl,
      creditsInvested: inv.creditsInvested,
      sharesAcquired: inv.sharesAcquired,
      sharePercentage: inv.sharePercentage,
      status: inv.status,
      createdAt: inv.createdAt,
    }));

    return {
      ...project,
      backersCount: project.investments.length,
      fundingProgressPercentage: progressPercent,
      remainingGap,
      sharePrice,
      capTable,
      currentUserInvestment: currentUserHolding
        ? {
            creditsInvested: currentUserHolding.creditsInvested,
            sharesAcquired: currentUserHolding.sharesAcquired,
            sharePercentage: currentUserHolding.sharePercentage,
            status: currentUserHolding.status,
          }
        : null,
    };
  }

  /**
   * Launch a new creative pitch (Creator role only).
   * fundingGoal must be >= 500 and a multiple of 500.
   */
  public static async createProject(creatorId: string, input: CreateProjectInput) {
    const { title, description, fundingGoal, totalShares = 10000, categoryId, coverMediaUrl, deadline } = input;

    if (fundingGoal < 500 || fundingGoal % 500 !== 0) {
      throw new AppError(
        'Project funding goal must be at least 500 and a strict multiple of 500 ArtCredits',
        400,
        'INVALID_FUNDING_GOAL'
      );
    }

    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!cat) {
        throw new AppError('Specified category does not exist', 400, 'CATEGORY_NOT_FOUND');
      }
    }

    const project = await prisma.creativeProject.create({
      data: {
        creatorId,
        title,
        description,
        fundingGoal,
        totalShares: totalShares || 10000,
        categoryId: categoryId || null,
        coverMediaUrl: coverMediaUrl || null,
        deadline: deadline ? new Date(deadline) : null,
        status: ProjectStatus.OPEN,
      },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return project;
  }

  /**
   * Back a project via an IPO-style Blocked Amount / Escrow Hold model.
   * Step A: Funds are moved from spendable creditBalance to heldBalance (status: HELD, INVESTMENT_HOLD).
   * Step B: When newAmountRaised === fundingGoal, atomically settle all held balances (status: ALLOTTED, INVESTMENT_SETTLED),
   *         mark project FUNDED, and credit the creator with fundingGoal.
   */
  public static async investInProject(investorId: string, projectId: string, amount: number) {
    // 1. Strict Multiple of 500 check
    if (!amount || amount < 500 || amount % 500 !== 0) {
      throw new AppError(
        'Investments must be in multiples of 500 ArtCredits',
        400,
        'INVALID_INVESTMENT_INCREMENT'
      );
    }

    // 2. Atomic Ledger Transaction
    const txResult = await prisma.$transaction(async (tx) => {
      // Fresh row reads inside transaction
      const project = await tx.creativeProject.findUnique({
        where: { id: projectId },
        include: {
          creator: {
            select: { id: true, name: true, creditBalance: true, heldBalance: true },
          },
        },
      });

      if (!project) {
        throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Invariant: Creators cannot self-invest
      if (project.creatorId === investorId) {
        throw new AppError(
          'Creators cannot invest in their own creative projects',
          400,
          'CANNOT_INVEST_IN_OWN_PROJECT'
        );
      }

      // Invariant: Project must be OPEN
      if (project.status !== ProjectStatus.OPEN) {
        throw new AppError(
          'This project is not open for investment',
          400,
          'PROJECT_NOT_OPEN'
        );
      }

      // Invariant: Zero oversubscription
      const remainingGap = project.fundingGoal - project.amountRaised;
      if (amount > remainingGap) {
        throw new AppError(
          `Investment amount (${amount} AC) exceeds remaining funding goal (${remainingGap} AC)`,
          400,
          'OVERSUBSCRIPTION_ERROR'
        );
      }

      // Invariant: Investor must have enough available (spendable) demo ArtCredits
      const investor = await tx.user.findUnique({
        where: { id: investorId },
        select: { id: true, name: true, creditBalance: true, heldBalance: true },
      });

      if (!investor) {
        throw new AppError('Investor account not found', 404, 'USER_NOT_FOUND');
      }

      if (investor.creditBalance < amount) {
        throw new AppError(
          'Insufficient ArtCredits balance for this investment',
          400,
          'INSUFFICIENT_CREDITS'
        );
      }

      // Invariant: Calculate cumulative fractional shares
      const existingInv = await tx.projectInvestment.findUnique({
        where: {
          projectId_investorId: {
            projectId,
            investorId,
          },
        },
      });

      const newCreditsInvested = (existingInv?.creditsInvested || 0) + amount;
      const newAmountRaised = project.amountRaised + amount;
      const isNowFunded = newAmountRaised === project.fundingGoal;

      let newShares = Math.round((newCreditsInvested / project.fundingGoal) * project.totalShares);
      let sharesDelta = newShares - (existingInv?.sharesAcquired || 0);

      // STEP A: Block/Hold funds: Move from creditBalance (available) to heldBalance (escrow hold)
      const updatedInvestor = await tx.user.update({
        where: { id: investorId },
        data: {
          creditBalance: { decrement: amount },
          heldBalance: { increment: amount },
        },
      });

      // Record IPO hold in CreditTransaction ledger
      await tx.creditTransaction.create({
        data: {
          userId: investorId,
          amount: -amount,
          balanceAfter: updatedInvestor.creditBalance,
          type: CreditTransactionType.INVESTMENT_HOLD,
          referenceId: projectId,
          description: `Pledged ${amount} AC on hold for "${project.title}" (IPO escrow hold)`,
        },
      });

      // Upsert investment record with HELD status (or ALLOTTED if this pledge completes 100%)
      const sharePercentage = Number(((newShares / project.totalShares) * 100).toFixed(2));
      let updatedInvestment = await tx.projectInvestment.upsert({
        where: {
          projectId_investorId: {
            projectId,
            investorId,
          },
        },
        update: {
          creditsInvested: newCreditsInvested,
          sharesAcquired: newShares,
          sharePercentage,
          status: isNowFunded ? InvestmentStatus.ALLOTTED : InvestmentStatus.HELD,
        },
        create: {
          projectId,
          investorId,
          creditsInvested: newCreditsInvested,
          sharesAcquired: newShares,
          sharePercentage,
          status: isNowFunded ? InvestmentStatus.ALLOTTED : InvestmentStatus.HELD,
        },
      });

      // STEP B: If this pledge hits 100% funding, atomically settle ALL backers
      if (isNowFunded) {
        // 1. Allocate residual rounding shares so sharesAllocated === totalShares
        const totalAllocatedWithDelta = project.sharesAllocated + sharesDelta;
        const residualUnallocated = project.totalShares - totalAllocatedWithDelta;
        if (residualUnallocated > 0) {
          sharesDelta += residualUnallocated;
          newShares += residualUnallocated;
          updatedInvestment = await tx.projectInvestment.update({
            where: { id: updatedInvestment.id },
            data: { sharesAcquired: newShares },
          });
        }

        // 2. Fetch all pledges for this project and finalize settlement
        const allProjectPledges = await tx.projectInvestment.findMany({
          where: { projectId },
        });

        for (const pledge of allProjectPledges) {
          // Permanently deduct held balance
          const settledBacker = await tx.user.update({
            where: { id: pledge.investorId },
            data: {
              heldBalance: { decrement: pledge.creditsInvested },
            },
          });

          // Mark investment as ALLOTTED
          await tx.projectInvestment.update({
            where: { id: pledge.id },
            data: { status: InvestmentStatus.ALLOTTED },
          });

          // Record settlement event
          await tx.creditTransaction.create({
            data: {
              userId: pledge.investorId,
              amount: 0, // Held credits converted into permanent equity shares
              balanceAfter: settledBacker.creditBalance,
              type: CreditTransactionType.INVESTMENT_SETTLED,
              referenceId: projectId,
              description: `IPO allotment finalized: ${pledge.sharesAcquired} shares issued in "${project.title}" (${pledge.sharePercentage}%)`,
            },
          });
        }

        // 3. Payout project creator
        const updatedCreator = await tx.user.update({
          where: { id: project.creatorId },
          data: { creditBalance: { increment: project.fundingGoal } },
        });

        await tx.creditTransaction.create({
          data: {
            userId: project.creatorId,
            amount: project.fundingGoal,
            balanceAfter: updatedCreator.creditBalance,
            type: CreditTransactionType.PROJECT_FUNDING_RECEIVED,
            referenceId: projectId,
            description: `Project fully funded: "${project.title}" received ${project.fundingGoal} AC`,
          },
        });
      }

      // Update project raised amount and shares
      const updatedProject = await tx.creativeProject.update({
        where: { id: projectId },
        data: {
          amountRaised: { increment: amount },
          sharesAllocated: { increment: sharesDelta },
          status: isNowFunded ? ProjectStatus.FUNDED : project.status,
        },
      });

      return {
        investment: updatedInvestment,
        project: updatedProject,
        isNowFunded,
        investorBalance: updatedInvestor.creditBalance,
        investorHeldBalance: isNowFunded ? 0 : updatedInvestor.heldBalance,
        investorName: investor.name,
        creatorId: project.creatorId,
        projectTitle: project.title,
        fundingGoal: project.fundingGoal,
      };
    });

    // Post-transaction notifications
    try {
      await NotificationService.createNotification({
        recipientId: txResult.creatorId,
        actorId: investorId,
        type: NotificationType.PROJECT_BACKED,
        title: 'Project Backed!',
        message: `${txResult.investorName} pledged ${amount} ArtCredits on hold for "${txResult.projectTitle}"!`,
        resourceId: projectId,
        resourceType: 'PROJECT',
      });

      if (txResult.isNowFunded) {
        await NotificationService.createNotification({
          recipientId: txResult.creatorId,
          actorId: null,
          type: NotificationType.PROJECT_FUNDED,
          title: 'Project 100% Funded!',
          message: `Your project "${txResult.projectTitle}" reached its funding target of ${txResult.fundingGoal} ArtCredits!`,
          resourceId: projectId,
          resourceType: 'PROJECT',
        });
      }
    } catch {
      // Notifications should not rollback completed investments
    }

    return txResult;
  }

  /**
   * Cancel an open project and release all backer held funds back to their spendable balance.
   */
  public static async cancelProject(userId: string, projectId: string) {
    const project = await prisma.creativeProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    if (project.creatorId !== userId) {
      throw new AppError('Only the project creator can cancel this pitch', 403, 'FORBIDDEN');
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new AppError(
        'Only projects currently open for investment can be cancelled',
        400,
        'CANNOT_CANCEL_PROJECT'
      );
    }

    const cancelResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch all pledges currently on hold
      const heldPledges = await tx.projectInvestment.findMany({
        where: {
          projectId,
          status: InvestmentStatus.HELD,
        },
      });

      // 2. Release hold for each backer
      for (const pledge of heldPledges) {
        const releasedUser = await tx.user.update({
          where: { id: pledge.investorId },
          data: {
            creditBalance: { increment: pledge.creditsInvested },
            heldBalance: { decrement: pledge.creditsInvested },
          },
        });

        await tx.projectInvestment.update({
          where: { id: pledge.id },
          data: { status: InvestmentStatus.RELEASED },
        });

        await tx.creditTransaction.create({
          data: {
            userId: pledge.investorId,
            amount: pledge.creditsInvested,
            balanceAfter: releasedUser.creditBalance,
            type: CreditTransactionType.INVESTMENT_RELEASED,
            referenceId: projectId,
            description: `Escrow hold released: "${project.title}" cancelled. +${pledge.creditsInvested} AC returned to available balance`,
          },
        });
      }

      // 3. Mark project cancelled
      const updatedProject = await tx.creativeProject.update({
        where: { id: projectId },
        data: { status: ProjectStatus.CANCELLED },
      });

      return {
        project: updatedProject,
        releasedBackersCount: heldPledges.length,
        heldPledges,
      };
    });

    // Notify backers of cancellation & refund
    for (const pledge of cancelResult.heldPledges) {
      try {
        await NotificationService.createNotification({
          recipientId: pledge.investorId,
          actorId: userId,
          type: NotificationType.SYSTEM,
          title: 'Project Cancelled - Funds Released',
          message: `"${project.title}" was cancelled. Your ${pledge.creditsInvested} AC on hold has been released back to your available balance.`,
          resourceId: projectId,
          resourceType: 'PROJECT',
        });
      } catch {
        // Notification failure shouldn't abort
      }
    }

    return cancelResult;
  }
}
