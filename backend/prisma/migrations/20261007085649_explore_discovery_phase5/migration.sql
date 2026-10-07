-- CreateIndex
CREATE INDEX "CreatorProfile_isPublic_primaryCategoryId_idx" ON "CreatorProfile"("isPublic", "primaryCategoryId");

-- CreateIndex
CREATE INDEX "CreatorProfile_isPublic_profileCompletionScore_idx" ON "CreatorProfile"("isPublic", "profileCompletionScore");

-- CreateIndex
CREATE INDEX "CreatorProfile_isPublic_createdAt_idx" ON "CreatorProfile"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "Post_status_categoryId_idx" ON "Post"("status", "categoryId");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
