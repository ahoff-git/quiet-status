import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { seedDefaultUsers } from './seed';

let db: ReturnType<typeof drizzle> | undefined;

export async function getDb() {
  if (!db) {
    const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    if (!url) {
      throw new Error('POSTGRES_URL is not set');
    }

    // Prefer direct connection for migrations and disable prepared statements for pgbouncer compat
    const client = postgres(url, { max: 1, prepare: false });
    db = drizzle(client);
    // Run migrations once on first connect
    await migrate(db, { migrationsFolder: './drizzle' });
    await seedDefaultUsers(db);
  }

  return db;
}

