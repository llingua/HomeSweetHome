import { NextResponse } from 'next/server';
import { fetchHaStates } from '@/lib/ha';

function parseEntityIds(value: string | null) {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseForecastTime(value: unknown) {
  if (!value) return null;
  if (typeof value === 'number') {
    const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(milliseconds).toISOString();
  }
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function pickForecastValue(entry: Record<string, unknown>) {
  const preferredKeys = [
    'temperature',
    'temp',
    'value',
    'temperature_high',
    'temperature_low',
    'templow',
    'temp_low',
    'temp_high',
  ];
  for (const key of preferredKeys) {
    const value = entry[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  const fallback = Object.values(entry).find(
    (value) =>
      (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && Number.isFinite(Number.parseFloat(value))),
  );
  if (typeof fallback === 'number') return fallback;
  if (typeof fallback === 'string') return Number.parseFloat(fallback);
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = parseEntityIds(searchParams.get('ids'));

  try {
    const states = await fetchHaStates();
    const filtered = ids.length
      ? states.filter((entity) => ids.includes(entity.entity_id))
      : states;
    const series = filtered
      .map((entity) => {
        const forecast = Array.isArray(entity.attributes?.forecast)
          ? (entity.attributes.forecast as Array<Record<string, unknown>>)
          : [];
        if (forecast.length === 0) return null;
        const points = forecast
          .map((entry) => {
            const timeValue = parseForecastTime(
              entry.datetime ?? entry.time ?? entry.timestamp ?? entry.date,
            );
            const value = pickForecastValue(entry);
            if (!timeValue || value === null || !Number.isFinite(value)) return null;
            return { time: timeValue, value };
          })
          .filter((point): point is { time: string; value: number } => !!point);
        if (points.length === 0) return null;
        const name =
          (entity.attributes?.friendly_name as string | undefined) ?? entity.entity_id;
        return { id: entity.entity_id, name, points };
      })
      .filter(
        (entry): entry is { id: string; name: string; points: Array<{ time: string; value: number }> } =>
          Boolean(entry),
      );

    return NextResponse.json({ series });
  } catch (error) {
    console.error('HA forecast fetch failed:', error);
    return NextResponse.json({ series: [] }, { status: 200 });
  }
}
