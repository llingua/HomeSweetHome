import { NextResponse } from 'next/server';
import { fetchHaStates } from '@/lib/ha';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() ?? '';

  try {
    const states = await fetchHaStates();
    const filtered = states.filter((entity) => {
      if (!query) return true;
      return entity.entity_id.toLowerCase().includes(query);
    });
    return NextResponse.json({ entities: filtered });
  } catch (error) {
    return NextResponse.json({ entities: [] }, { status: 200 });
  }
}
