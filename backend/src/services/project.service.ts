import { prisma } from '../config/database.js';
import { ProjectStatus, NotificationType } from '@prisma/client';
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
   * Invest demo ArtCredits in exchange for proportional fractional shares.
   * Atomically executes balance check, oversubscription guard, cumulative share math, and auto-funded transition.
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
            select: { id: true, name: true, creditBalance: true },
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

      // Invariant: Investor must have enough demo ArtCredits
      const investor = await tx.user.findUnique({
        where: { id: investorId },
        select: { id: true, name: true, creditBalance: true },
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

      // If project hits 100% funding, allocate all residual unallocated shares so sharesAllocated === totalShares
      if (isNowFunded) {
        const totalAllocatedWithDelta = project.sharesAllocated + sharesDelta;
        const residualUnallocated = project.totalShares - totalAllocatedWithDelta;
        if (residualUnallocated > 0) {
          sharesDelta += residualUnallocated;
          newShares += residualUnallocated;
        }
      }

      const sharePercentage = Number(((newShares / project.totalShares) * 100).toFixed(2));

      // 1. Deduct investor balance
      const updatedInvestor = await tx.user.update({
        where: { id: investorId },
        data: { creditBalance: { decrement: amount } },
      });

      // 2. Record investor credit debit in transaction ledger
      await tx.creditTransaction.create({
        data: {
          userId: investorId,
          amount: -amount,
          balanceAfter: updatedInvestor.creditBalance,
          type: 'PROJECT_INVESTMENT',
          referenceId: projectId,
          description: `Fractional backing in "${project.title}" (+${sharesDelta} shares)`,
        },
      });

      // 3. Upsert investor fractional holding
      const updatedInvestment = await tx.projectInvestment.upsert({
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
        },
        create: {
          projectId,
          investorId,
          creditsInvested: newCreditsInvested,
          sharesAcquired: newShares,
          sharePercentage,
        },
      });

      // 4. Update project raised amount, allocated shares, and status
      const updatedProject = await tx.creativeProject.update({
        where: { id: projectId },
        data: {
          amountRaised: { increment: amount },
          sharesAllocated: { increment: sharesDelta },
          status: isNowFunded ? ProjectStatus.FUNDED : project.status,
        },
      });

      // 5. If fully funded, payout creator and record credit transaction
      let updatedCreatorBalance = project.creator.creditBalance;
      if (isNowFunded) {
        const updatedCreator = await tx.user.update({
          where: { id: project.creatorId },
          data: { creditBalance: { increment: project.fundingGoal } },
        });
        updatedCreatorBalance = updatedCreator.creditBalance;

        await tx.creditTransaction.create({
          data: {
            userId: project.creatorId,
            amount: project.fundingGoal,
            balanceAfter: updatedCreator.creditBalance,
            type: 'PROJECT_FUNDING_RECEIVED',
            referenceId: projectId,
            description: `Project fully funded: "${project.title}" received ${project.fundingGoal} AC`,
          },
        });
      }

      return {
        investment: updatedInvestment,
        project: updatedProject,
        isNowFunded,
        investorBalance: updatedInvestor.creditBalance,
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
        message: `${txResult.investorName} invested ${amount} ArtCredits in "${txResult.projectTitle}"!`,
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
}
