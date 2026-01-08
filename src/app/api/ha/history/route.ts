import { NextResponse } from 'next/server';
import { fetchHaHistory } from '@/lib/ha';

function parseEntityIds(value: string | null) {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = parseEntityIds(searchParams.get('ids'));
  const rangeHours = Number(searchParams.get('rangeHours') ?? '24');
  const safeRangeHours = Number.isFinite(rangeHours) && rangeHours > 0 ? rangeHours : 24;
  const start = new Date(Date.now() - safeRangeHours * 60 * 60 * 1000).toISOString();

  try {
    const history = await fetchHaHistory(ids, start);
    const series = history
      .map((entityStates) => {
        const id = entityStates[0]?.entity_id;
        if (!id) return null;
        const name =
          (entityStates[0]?.attributes?.friendly_name as string | undefined) ?? id;
        const points = entityStates
          .map((state) => {
            const value = Number.parseFloat(state.state);
            if (!Number.isFinite(value)) return null;
            return { time: state.last_changed, value };
          })
          .filter((point): point is { time: string; value: number } => !!point);
        return { id, name, points };
      })
      .filter(
        (entry): entry is { id: string; name: string; points: Array<{ time: string; value: number }> } =>
          Boolean(entry),
      );

    return NextResponse.json({ series });
  } catch (error) {
    console.error('HA history fetch failed:', error);
    return NextResponse.json({ series: [] }, { status: 200 });
  }
}
