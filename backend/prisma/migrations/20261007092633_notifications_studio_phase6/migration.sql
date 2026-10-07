-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'POST_LIKED';
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'CREATOR_FOLLOWED';
ALTER TYPE "NotificationType" ADD VALUE 'COLLABORATION_INQUIRY_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'COLLABORATION_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'COLLABORATION_DECLINED';

-- DropIndex
DROP INDEX "Notification_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_isRead_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");
