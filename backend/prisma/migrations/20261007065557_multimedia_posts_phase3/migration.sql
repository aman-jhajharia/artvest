-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "creatorProfileId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PostMedia" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateTable
CREATE TABLE "_PostToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PostToSkill_B_index" ON "_PostToSkill"("B");

-- CreateIndex
CREATE INDEX "Post_creatorProfileId_idx" ON "Post"("creatorProfileId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToSkill" ADD CONSTRAINT "_PostToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToSkill" ADD CONSTRAINT "_PostToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
