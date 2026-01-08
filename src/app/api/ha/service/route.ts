import { NextResponse } from 'next/server';
import { callHaService, HaServiceRequest } from '@/lib/ha';

export async function POST(request: Request) {
  const payload = (await request.json()) as HaServiceRequest;

  try {
    const result = await callHaService(payload);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
