import { NextResponse } from 'next/server';
import { fetchHaStates } from '@/lib/ha';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() ?? '';
  const ids = searchParams
    .get('ids')
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  try {
    const states = await fetchHaStates();
    const byId = ids?.length ? states.filter((entity) => ids.includes(entity.entity_id)) : states;
    const filtered = byId.filter((entity) => {
      if (!query) return true;
      return entity.entity_id.toLowerCase().includes(query);
    });
    return NextResponse.json({ entities: filtered });
  } catch (error) {
    console.error('HA entities fetch failed:', error);
    return NextResponse.json({ entities: [] }, { status: 200 });
  }
}
