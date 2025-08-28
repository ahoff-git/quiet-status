import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users, userSettings } from "./schema";

export async function getUserSettings(userId: number) {
  const db = await getDb();
  const [row] = await db
    .select({ displayName: users.displayName, color: userSettings.color })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.id, userId));
  return row;
}

export async function updateUserSettings(
  userId: number,
  displayName: string,
  color: string
) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    await tx.update(users).set({ displayName }).where(eq(users.id, userId));
    const existing = await tx
      .select({ id: userSettings.id })
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    if (existing.length > 0) {
      await tx
        .update(userSettings)
        .set({ color })
        .where(eq(userSettings.userId, userId));
    } else {
      await tx.insert(userSettings).values({ userId, color });
    }
  });
}
