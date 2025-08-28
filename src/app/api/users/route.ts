import { NextRequest, NextResponse } from "next/server";
import { createUser, listUsersWithPasswordFlag } from "@/db/users";

export async function POST(request: NextRequest) {
  const { displayName } = await request.json();
  if (!displayName) {
    return NextResponse.json(
      { error: "displayName is required" },
      { status: 400 }
    );
  }

  const { id } = await createUser(displayName);
  return NextResponse.json({ id });
}

export async function GET() {
  const users = await listUsersWithPasswordFlag();
  return NextResponse.json(users);
}
