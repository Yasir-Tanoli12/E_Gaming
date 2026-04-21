-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "telegram" DROP DEFAULT;

-- AlterTable
ALTER TABLE "NewsPoster" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Blog_created_at_idx" ON "Blog"("created_at" DESC);

-- CreateIndex
CREATE INDEX "Faq_created_at_idx" ON "Faq"("created_at" DESC);

-- CreateIndex
CREATE INDEX "Game_is_active_sort_order_idx" ON "Game"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "Game_is_active_id_idx" ON "Game"("is_active", "id");

-- CreateIndex
CREATE INDEX "NewsPoster_is_active_idx" ON "NewsPoster"("is_active");

-- CreateIndex
CREATE INDEX "Review_is_featured_created_at_idx" ON "Review"("is_featured", "created_at" DESC);
