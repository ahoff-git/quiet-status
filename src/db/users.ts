import { getDb } from "./index";
import { users, userSettings } from "./schema";
import { eq } from "drizzle-orm";
import { randomHexColor } from "@/utils/color";
import { hashPassword, verifyPassword } from "@/utils/password";

export async function createUser(displayName: string) {
  const db = await getDb();
  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(users)
      .values({ displayName })
      .returning({ id: users.id });

    const color = randomHexColor();
    await tx.insert(userSettings).values({ userId: inserted.id, color });

    return inserted;
  });

  return result;
}

export async function softDeleteUser(userId: number) {
  const db = await getDb();
  await db.update(users).set({ isActive: false }).where(eq(users.id, userId));
}

export async function setUserPassword(userId: number, password: string) {
  const db = await getDb();
  const passwordHash = hashPassword(password);
  try {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  } catch (err: unknown) {
    type PgLikeError = { code?: unknown; cause?: { code?: unknown } };
    const anyErr = err as PgLikeError;
    const code = anyErr?.code ?? anyErr?.cause?.code;
    if (code === '42703') {
      // Column not migrated yet; treat as no-op so API doesn't 500
      return;
    }
    throw err;
  }
}

export async function clearUserPassword(userId: number) {
  const db = await getDb();
  try {
    await db.update(users).set({ passwordHash: null }).where(eq(users.id, userId));
  } catch (err: unknown) {
    type PgLikeError = { code?: unknown; cause?: { code?: unknown } };
    const anyErr = err as PgLikeError;
    const code = anyErr?.code ?? anyErr?.cause?.code;
    if (code === '42703') {
      // Column not migrated yet; treat as no-op
      return;
    }
    throw err;
  }
}

export async function verifyUserPassword(userId: number, password: string) {
  const db = await getDb();
  try {
    const [row] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId));
    if (!row) return false;
    return verifyPassword(row.passwordHash ?? null, password);
  } catch (err: unknown) {
    type PgLikeError = { code?: unknown; cause?: { code?: unknown } };
    const anyErr = err as PgLikeError;
    const code = anyErr?.code ?? anyErr?.cause?.code;
    if (code === '42703') {
      // If the password column doesn't exist yet, treat as no password set
      return password === '';
    }
    throw err;
  }
}

export async function listUsersWithPasswordFlag() {
  const db = await getDb();
  try {
    const rows = await db
      .select({ id: users.id, displayName: users.displayName, passwordHash: users.passwordHash, isActive: users.isActive })
      .from(users);
    return rows
      .filter((u) => u.isActive)
      .map((u) => ({ id: u.id, displayName: u.displayName, hasPassword: !!(u.passwordHash && u.passwordHash.length > 0) }));
  } catch (err: unknown) {
    type PgLikeError = { code?: unknown; cause?: { code?: unknown } };
    const anyErr = err as PgLikeError;
    const code = anyErr?.code ?? anyErr?.cause?.code;
    if (code === '42703') {
      const rows = await db
        .select({ id: users.id, displayName: users.displayName, isActive: users.isActive })
        .from(users);
      return rows.filter((u) => u.isActive).map((u) => ({ id: u.id, displayName: u.displayName, hasPassword: false }));
    }
    throw err;
  }
}
