import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/db/users";

export async function POST(request: NextRequest) {
  const { displayName, color } = await request.json();
  if (!displayName || !color) {
    return NextResponse.json(
      { error: "displayName and color are required" },
      { status: 400 }
    );
  }

  const { id } = await createUser(displayName, color);
  return NextResponse.json({ id });
}
