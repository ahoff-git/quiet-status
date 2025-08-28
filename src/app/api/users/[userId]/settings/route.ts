import { NextRequest, NextResponse } from "next/server";
import { getUserSettings, updateUserSettings } from "@/db/userSettings";
import { softDeleteUser } from "@/db/users";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId: userIdParam } = await context.params;
  const userId = Number(userIdParam);
  const data = await getUserSettings(userId);
  return NextResponse.json(data ?? {});
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId: userIdParam } = await context.params;
  const userId = Number(userIdParam);
  const { displayName, color } = await request.json();
  await updateUserSettings(userId, displayName, color);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId: userIdParam } = await context.params;
  const userId = Number(userIdParam);
  await softDeleteUser(userId);
  return NextResponse.json({ ok: true });
}
