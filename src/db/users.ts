import { getDb } from "./index";
import { users, userSettings } from "./schema";
import { eq } from "drizzle-orm";
import { randomHexColor } from "@/utils/color";

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
