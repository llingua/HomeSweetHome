import { NextResponse } from 'next/server';
import { DashboardConfig } from '@/lib/dashboardConfig';
import { readDashboardConfig, writeDashboardConfig } from '@/lib/storage';

export async function GET() {
  const config = await readDashboardConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as DashboardConfig;
  const nextConfig: DashboardConfig = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  await writeDashboardConfig(nextConfig);
  return NextResponse.json(nextConfig);
}
