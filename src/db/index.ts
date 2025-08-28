import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

let db:
  | ReturnType<typeof drizzle>
  | undefined;

export function getDb() {
  if (!db) {
    const url = process.env.POSTGRES_URL;
    if (!url) {
      throw new Error('POSTGRES_URL is not set');
    }

    const client = postgres(url);
    db = drizzle(client);
  }

  return db;
}

