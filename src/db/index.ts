import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';
import { seedDefaultUsers } from './seed';
import { retry } from '../utils/retry';

let db: ReturnType<typeof drizzle> | undefined;

const DB_RETRY_ATTEMPTS = 5;
const DB_RETRY_DELAY_MS = 1000;
const MIGRATIONS_FOLDER = path.join(process.cwd(), 'drizzle');

async function connect(url: string) {
  // Prefer direct connection for migrations and disable prepared statements for pgbouncer compat
  const client = postgres(url, { max: 1, prepare: false });
  const connection = drizzle(client);
  // Run migrations once on first connect
  await migrate(connection, { migrationsFolder: MIGRATIONS_FOLDER });
  await seedDefaultUsers(connection);
  return connection;
}

export async function getDb() {
  if (!db) {
    const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    if (!url) {
      throw new Error('POSTGRES_URL is not set');
    }

    db = await retry(() => connect(url), DB_RETRY_ATTEMPTS, DB_RETRY_DELAY_MS);
  }

  return db;
}

