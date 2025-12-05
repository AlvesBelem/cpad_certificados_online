-- Add assinaturaPausada flag to Igreja for manual subscription pause
ALTER TABLE "Igreja"
ADD COLUMN "assinaturaPausada" BOOLEAN NOT NULL DEFAULT false;
