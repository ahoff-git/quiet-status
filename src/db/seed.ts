import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { users } from "./schema";

const DEFAULT_USERS = ["Monica", "Adam", "Grammy", "Papa"];

// Accept a drizzle DB typed with an unknown schema to align with drizzle(client)
export async function seedDefaultUsers(
  db: PostgresJsDatabase<Record<string, unknown>>
) {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    await db
      .insert(users)
      .values(DEFAULT_USERS.map((displayName) => ({ displayName })));
  }
}
