import { NextRequest, NextResponse } from "next/server";
import { verifyUserPassword } from "@/db/users";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId: userIdParam } = await context.params;
  const userId = Number(userIdParam);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }
  const { password } = await request.json();
  // Allow blank passwords to be verified (treat as optional credentials)
  const ok = await verifyUserPassword(userId, String(password ?? ""));
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
