import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { users } from "./schema";

const DEFAULT_USERS = ["Monica", "Adam", "Grammy", "Papa"];

export async function seedDefaultUsers(db: PostgresJsDatabase) {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    await db
      .insert(users)
      .values(DEFAULT_USERS.map((displayName) => ({ displayName })));
  }
}
