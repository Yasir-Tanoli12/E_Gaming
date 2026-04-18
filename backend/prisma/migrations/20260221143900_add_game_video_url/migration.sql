-- AlterTable (idempotent: DB may already have this column outside Prisma migrate history)
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "video_url" TEXT;
