import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { users, userSettings } from "./schema";
import { randomHexColor } from "@/utils/color";

const DEFAULT_USERS = ["Monica", "Adam", "Grammy", "Papa"];

// Accept a drizzle DB typed with an unknown schema to align with drizzle(client)
export async function seedDefaultUsers(
  db: PostgresJsDatabase<Record<string, unknown>>
) {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    const inserted = await db
      .insert(users)
      .values(DEFAULT_USERS.map((displayName) => ({ displayName })))
      .returning({ id: users.id });

    if (inserted.length > 0) {
      await db.insert(userSettings).values(
        inserted.map(({ id }) => ({
          userId: id,
          color: randomHexColor(),
          fontSize: 16,
        }))
      );
    }
  }
}
