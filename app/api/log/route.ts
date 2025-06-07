import { NextResponse } from 'next/server';
import MyDBAdapter from '@/app/lib/adapter';

export async function POST(req: Request) {
  const formData = await req.formData();

  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'Unknown';

  formData.append('ip_address', ip);

  const adapter = MyDBAdapter();
  await adapter.applicationLog(formData);

  return NextResponse.json({ status: 'ok' });
}