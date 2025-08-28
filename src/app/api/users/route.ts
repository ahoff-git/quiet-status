import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/db/users";

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
