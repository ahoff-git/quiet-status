import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Prefer a direct/non-pooled connection for migrations (e.g., Supabase 5432)
// Fallback to pooled URL for commands that don't need a direct connection.
const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  // dbCredentials are only required for commands that talk to the DB (push/migrate/introspect).
  // Leaving this undefined when no URL is present allows `generate` to work without a DB.
  ...(url ? { dbCredentials: { url } } : {}),
});
