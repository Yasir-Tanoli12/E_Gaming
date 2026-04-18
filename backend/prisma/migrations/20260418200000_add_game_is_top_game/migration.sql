-- Align DB with schema: Game.isTopGame (was missing from historical migrations)
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "is_top_game" BOOLEAN NOT NULL DEFAULT false;
