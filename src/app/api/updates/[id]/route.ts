import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { updates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const { id } = await context.params;
  const updateId = Number(id);
  if (!Number.isFinite(updateId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const viewerIdParam = searchParams.get("viewerId");
  const viewerId = viewerIdParam ? Number(viewerIdParam) : NaN;
  if (!Number.isFinite(viewerId)) {
    return NextResponse.json({ error: "viewerId required" }, { status: 400 });
  }

  const [row] = await db
    .select({
      id: updates.id,
      userId: updates.userId,
      message: updates.message,
      createdAt: updates.createdAt,
      expiresAt: updates.expiresAt,
      reach: updates.reach,
    })
    .from(updates)
    .where(eq(updates.id, updateId));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.userId !== viewerId && viewerId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(row);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const { id } = await context.params;
  const updateId = Number(id);
  if (!Number.isFinite(updateId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const userId = Number(body.userId);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const [existing] = await db
    .select({ userId: updates.userId })
    .from(updates)
    .where(eq(updates.id, updateId));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== userId && userId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  type UpdateShape = {
    message?: string;
    expiresAt?: Date | null;
    reach?: number[] | null;
  };
  const set: UpdateShape = {};

  if (Object.prototype.hasOwnProperty.call(body, "message")) {
    const msg = String(body.message ?? "").trim();
    if (!msg) return NextResponse.json({ error: "message cannot be empty" }, { status: 400 });
    set.message = msg;
  }

  if (Object.prototype.hasOwnProperty.call(body, "expiresAt")) {
    const ex = body.expiresAt as string | null | undefined;
    if (ex === null || ex === "") {
      set.expiresAt = null;
    } else if (typeof ex === "string") {
      const d = new Date(ex);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
      }
      set.expiresAt = d;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "reachUserIds")) {
    const arr = body.reachUserIds as number[] | null | undefined;
    if (!arr || (Array.isArray(arr) && arr.length === 0)) {
      set.reach = null; // visible to everyone
    } else if (Array.isArray(arr)) {
      const cleaned = arr.map((n) => Number(n)).filter((n) => Number.isFinite(n));
      set.reach = cleaned.length > 0 ? cleaned : null;
    }
  }

  if (Object.keys(set).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  await db.update(updates).set(set).where(eq(updates.id, updateId));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const { id } = await context.params;
  const updateId = Number(id);
  if (!Number.isFinite(updateId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {}
  const userId = Number(body.userId);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const [existing] = await db
    .select({ userId: updates.userId })
    .from(updates)
    .where(eq(updates.id, updateId));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== userId && userId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(updates).where(eq(updates.id, updateId));
  return NextResponse.json({ ok: true });
}
