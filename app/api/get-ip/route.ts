// /app/api/get-ip/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('host') || 'Unknown';
  return NextResponse.json({ ip });
}