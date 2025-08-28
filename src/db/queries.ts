import { desc, eq, gt } from 'drizzle-orm';
import { getDb } from './index';
import { updates, users, userSettings } from './schema';

export type UpdateRecord = {
  id: number;
  message: string;
  createdAt: string;
  displayName: string;
  color: string | null;
};

const updateFields = {
  id: updates.id,
  message: updates.message,
  createdAt: updates.createdAt,
  displayName: users.displayName,
  color: userSettings.color,
};

const baseQuery = (db: Awaited<ReturnType<typeof getDb>>) =>
  db
    .select(updateFields)
    .from(updates)
    .innerJoin(users, eq(users.id, updates.userId))
    .leftJoin(userSettings, eq(users.id, userSettings.userId));

export async function fetchUpdatesSince(since: Date): Promise<UpdateRecord[]> {
  const db = await getDb();
  const rows = await baseQuery(db)
    .where(gt(updates.createdAt, since))
    .orderBy(desc(updates.createdAt));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function insertUpdate(
  userId: number,
  message: string,
): Promise<UpdateRecord> {
  const db = await getDb();
  const [inserted] = await db
    .insert(updates)
    .values({ userId, message })
    .returning({ id: updates.id });

  const [row] = await baseQuery(db).where(eq(updates.id, inserted.id));
  return { ...row, createdAt: row.createdAt.toISOString() };
}
