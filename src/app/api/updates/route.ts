import { NextResponse } from 'next/server';
import { fetchUpdatesSince, insertUpdate } from '../../../db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get('since');
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await fetchUpdatesSince(since);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { message, userId } = await request.json();
  if (!message || !userId) {
    return NextResponse.json(
      { error: 'message and userId are required' },
      { status: 400 },
    );
  }
  const row = await insertUpdate(userId, message);
  return NextResponse.json(row, { status: 201 });
}
