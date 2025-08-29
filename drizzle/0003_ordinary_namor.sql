-- Cleaned migration: only add the missing column to user_settings.
-- Other columns were added in prior migrations:
--  - 0001_soft_delete_users.sql: users.is_active
--  - 0002_updates_reach_and_expiry.sql: updates.reach, updates.expires_at
--  - 0003_add_password_hash.sql: users.password_hash
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "font_size" integer DEFAULT 16 NOT NULL;
