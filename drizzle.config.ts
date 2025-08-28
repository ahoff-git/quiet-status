import { defineConfig } from 'drizzle-kit';

const url = process.env.POSTGRES_URL;

if (!url) {
  throw new Error('POSTGRES_URL is not set');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url,
  },
});
