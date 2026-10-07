-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "CollaborationInquiry" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "postId" TEXT,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaborationInquiry_senderId_idx" ON "CollaborationInquiry"("senderId");

-- CreateIndex
CREATE INDEX "CollaborationInquiry_recipientId_idx" ON "CollaborationInquiry"("recipientId");

-- CreateIndex
CREATE INDEX "CollaborationInquiry_postId_idx" ON "CollaborationInquiry"("postId");

-- CreateIndex
CREATE INDEX "CollaborationInquiry_status_idx" ON "CollaborationInquiry"("status");

-- CreateIndex
CREATE INDEX "CollaborationInquiry_createdAt_idx" ON "CollaborationInquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "CollaborationInquiry" ADD CONSTRAINT "CollaborationInquiry_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationInquiry" ADD CONSTRAINT "CollaborationInquiry_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationInquiry" ADD CONSTRAINT "CollaborationInquiry_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
