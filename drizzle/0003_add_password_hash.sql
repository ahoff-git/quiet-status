-- Add password_hash column to users for optional account passwords
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;

