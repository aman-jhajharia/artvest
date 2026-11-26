-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('OPEN', 'FUNDED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('SIGNUP_BONUS', 'DEMO_TOPUP', 'PROJECT_INVESTMENT', 'PROJECT_FUNDING_RECEIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PROJECT_BACKED';
ALTER TYPE "NotificationType" ADD VALUE 'PROJECT_FUNDED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creditBalance" INTEGER NOT NULL DEFAULT 10000;

-- CreateTable
CREATE TABLE "CreativeProject" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT,
    "coverMediaUrl" TEXT,
    "fundingGoal" INTEGER NOT NULL,
    "amountRaised" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 10000,
    "sharesAllocated" INTEGER NOT NULL DEFAULT 0,
    "status" "ProjectStatus" NOT NULL DEFAULT 'OPEN',
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativeProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInvestment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "creditsInvested" INTEGER NOT NULL DEFAULT 0,
    "sharesAcquired" INTEGER NOT NULL DEFAULT 0,
    "sharePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInvestment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "referenceId" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreativeProject_creatorId_idx" ON "CreativeProject"("creatorId");

-- CreateIndex
CREATE INDEX "CreativeProject_status_idx" ON "CreativeProject"("status");

-- CreateIndex
CREATE INDEX "CreativeProject_categoryId_idx" ON "CreativeProject"("categoryId");

-- CreateIndex
CREATE INDEX "CreativeProject_createdAt_idx" ON "CreativeProject"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectInvestment_investorId_idx" ON "ProjectInvestment"("investorId");

-- CreateIndex
CREATE INDEX "ProjectInvestment_projectId_idx" ON "ProjectInvestment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvestment_projectId_investorId_key" ON "ProjectInvestment"("projectId", "investorId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "CreativeProject" ADD CONSTRAINT "CreativeProject_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeProject" ADD CONSTRAINT "CreativeProject_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvestment" ADD CONSTRAINT "ProjectInvestment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CreativeProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvestment" ADD CONSTRAINT "ProjectInvestment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
