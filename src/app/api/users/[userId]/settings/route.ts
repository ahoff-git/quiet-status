import { NextResponse } from "next/server";
import { getUserSettings, updateUserSettings } from "@/db/userSettings";

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = Number(params.userId);
  const data = await getUserSettings(userId);
  return NextResponse.json(data ?? {});
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = Number(params.userId);
  const { displayName, color } = await request.json();
  await updateUserSettings(userId, displayName, color);
  return NextResponse.json({ ok: true });
}
