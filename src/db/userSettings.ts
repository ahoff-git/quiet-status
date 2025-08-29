import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users, userSettings } from "./schema";

export async function getUserSettings(userId: number) {
  const db = await getDb();
  try {
    const [row] = await db
      .select({
        displayName: users.displayName,
        color: userSettings.color,
        fontSize: userSettings.fontSize,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.userId))
      .where(eq(users.id, userId));
    if (!row) return undefined;
    const {
      displayName,
      color,
      fontSize,
      passwordHash,
    } = row as {
      displayName: string;
      color: string | null;
      fontSize: number | null;
      passwordHash: string | null;
    };
    return {
      displayName,
      color,
      fontSize: fontSize ?? 16,
      hasPassword: !!(passwordHash && passwordHash.length > 0),
    } as const;
  } catch (err: unknown) {
    // Gracefully handle environments where the password column hasn't been migrated yet
    type PgLikeError = { code?: unknown; cause?: { code?: unknown } };
    const anyErr = err as PgLikeError;
    const code = anyErr?.code ?? anyErr?.cause?.code;
    if (code === '42703') {
      // Retry with only columns that are guaranteed to exist pre-migration.
      const [row] = await db
        .select({
          displayName: users.displayName,
          color: userSettings.color,
        })
        .from(users)
        .leftJoin(userSettings, eq(users.id, userSettings.userId))
        .where(eq(users.id, userId));
      if (!row) return undefined;
      const { displayName, color } = row as {
        displayName: string;
        color: string | null;
      };
      return {
        displayName,
        color,
        fontSize: 16,
        hasPassword: false,
      } as const;
    }
    throw err;
  }
}

export async function updateUserSettings(
  userId: number,
  displayName: string,
  color: string,
  fontSize: number
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
        .set({ color, fontSize })
        .where(eq(userSettings.userId, userId));
    } else {
      await tx.insert(userSettings).values({ userId, color, fontSize });
    }
  });
}
