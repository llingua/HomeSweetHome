import { NextResponse } from 'next/server';
import { fetchHaStates } from '@/lib/ha';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',').map((id) => id.trim());

  try {
    const states = await fetchHaStates();
    const filtered = ids?.length
      ? states.filter((entity) => ids.includes(entity.entity_id))
      : states;
    return NextResponse.json({ entities: filtered });
  } catch (error) {
    return NextResponse.json({ entities: [] }, { status: 200 });
  }
}
