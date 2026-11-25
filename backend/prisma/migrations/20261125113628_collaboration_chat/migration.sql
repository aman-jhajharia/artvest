-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'COLLABORATION_MESSAGE_RECEIVED';

-- CreateTable
CREATE TABLE "CollaborationMessage" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaborationMessage_inquiryId_createdAt_idx" ON "CollaborationMessage"("inquiryId", "createdAt");

-- CreateIndex
CREATE INDEX "CollaborationMessage_senderId_idx" ON "CollaborationMessage"("senderId");

-- AddForeignKey
ALTER TABLE "CollaborationMessage" ADD CONSTRAINT "CollaborationMessage_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "CollaborationInquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationMessage" ADD CONSTRAINT "CollaborationMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
