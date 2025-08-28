import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { updates, users, userSettings } from "@/db/schema";

export async function GET(request: NextRequest) {
  const db = await getDb();

  const { searchParams } = new URL(request.url);
  const viewerIdParam = searchParams.get("viewerId");
  const viewerId = viewerIdParam ? Number(viewerIdParam) : undefined;

  // Keep existing 24h window and respect reach (do not hide by expiry)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const reachCond = viewerId
    ? sql`${updates.reach} IS NULL OR ${viewerId} = ANY(${updates.reach})`
    : sql`${updates.reach} IS NULL`;

  const rows = await db
    .select({
      id: updates.id,
      message: updates.message,
      createdAt: updates.createdAt,
      expiresAt: updates.expiresAt,
      displayName: users.displayName,
      color: userSettings.color,
    })
    .from(updates)
    .innerJoin(users, eq(users.id, updates.userId))
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(and(gt(updates.createdAt, since), reachCond))
    .orderBy(desc(updates.createdAt));

  // Dates will serialize as strings automatically
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await request.json();
  const userId = Number(body.userId);
  const message = (body.message ?? "").trim();
  const expiresAtBody = body.expiresAt as string | undefined;
  const durationMinutes = body.durationMinutes as number | undefined;
  const reachUserIds = (body.reachUserIds ?? null) as number[] | null;

  if (!userId || !message) {
    return NextResponse.json(
      { error: "userId and message are required" },
      { status: 400 }
    );
  }

  // Prefer explicit expiresAt from client (ISO). Fallback to durationMinutes (legacy) or 24h.
  let expiresAt: Date | null = null;
  if (expiresAtBody) {
    const d = new Date(expiresAtBody);
    if (!Number.isNaN(d.getTime())) {
      expiresAt = d;
    }
  }
  if (!expiresAt) {
    const mins = Number.isFinite(durationMinutes) ? Number(durationMinutes) : 24 * 60;
    expiresAt = new Date(Date.now() + mins * 60 * 1000);
  }

  const [inserted] = await db
    .insert(updates)
    .values({
      userId,
      message,
      // Null reach means visible to everyone
      reach: reachUserIds && reachUserIds.length > 0 ? reachUserIds : null,
      expiresAt,
    })
    .returning({ id: updates.id, createdAt: updates.createdAt });

  return NextResponse.json({ id: inserted.id, createdAt: inserted.createdAt });
}
