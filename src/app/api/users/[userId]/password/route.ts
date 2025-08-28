import { NextRequest, NextResponse } from "next/server";
import { clearUserPassword, setUserPassword } from "@/db/users";

function getActorId(req: NextRequest): number | null {
  const header = req.headers.get("x-user-id");
  if (!header) return null;
  const id = Number(header);
  return Number.isFinite(id) ? id : null;
}

function canModify(actorId: number | null, targetId: number) {
  if (actorId == null) return false;
  // Admin (id=1) can modify any; user can modify self
  return actorId === 1 || actorId === targetId;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId: userIdParam } = await context.params;
  const userId = Number(userIdParam);
  const actorId = getActorId(request);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }
  if (!canModify(actorId, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { password } = await request.json();
  if (!password || String(password).length < 1) {
    return NextResponse.json({ error: "password is required" }, { status: 400 });
  }
  await setUserPassword(userId, String(password));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId: userIdParam } = await context.params;
  const userId = Number(userIdParam);
  const actorId = getActorId(request);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }
  if (!canModify(actorId, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await clearUserPassword(userId);
  return NextResponse.json({ ok: true });
}
