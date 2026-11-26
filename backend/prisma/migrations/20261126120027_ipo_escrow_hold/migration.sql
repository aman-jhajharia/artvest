-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('HELD', 'ALLOTTED', 'RELEASED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CreditTransactionType" ADD VALUE 'INVESTMENT_HOLD';
ALTER TYPE "CreditTransactionType" ADD VALUE 'INVESTMENT_SETTLED';
ALTER TYPE "CreditTransactionType" ADD VALUE 'INVESTMENT_RELEASED';

-- AlterTable
ALTER TABLE "ProjectInvestment" ADD COLUMN     "status" "InvestmentStatus" NOT NULL DEFAULT 'HELD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "heldBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ProjectInvestment_status_idx" ON "ProjectInvestment"("status");
