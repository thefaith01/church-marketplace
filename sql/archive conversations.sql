-- Archive conversations per user.
-- Run once in the Supabase SQL editor BEFORE merging the PR.
-- Safe to run twice. Adds two nullable columns; no data is changed or removed.
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "archivedByOneAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "archivedByTwoAt" TIMESTAMP(3);
