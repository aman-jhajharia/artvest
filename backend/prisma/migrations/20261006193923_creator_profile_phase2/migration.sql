-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "CreatorSkill" ADD COLUMN     "proficiency" TEXT DEFAULT 'INTERMEDIATE';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "CreatorProfile_isPublic_idx" ON "CreatorProfile"("isPublic");
