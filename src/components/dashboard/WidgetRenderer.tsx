'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassToggle } from '@/components/ui/GlassToggle';
import { GlassSlider } from '@/components/ui/GlassSlider';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { MapPanel } from '@/components/dashboard/MapPanel';
import { DashboardWidget } from '@/lib/dashboardConfig';

type HaEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
};

async function fetchStates(ids: string[]) {
  const query = ids.length ? `?ids=${encodeURIComponent(ids.join(','))}` : '';
  const response = await fetch(`/api/ha/states${query}`, { cache: 'no-store' });
  const payload = await response.json();
  return payload.entities as HaEntity[];
}

async function callService(domain: string, service: string, data: Record<string, unknown>) {
  await fetch('/api/ha/service', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, service, service_data: data }),
  });
}

function getDomain(entityId?: string) {
  return entityId?.split('.')[0] ?? '';
}

export function WidgetRenderer({ widget }: { widget: DashboardWidget }) {
  const entityIds = widget.entityId ? [widget.entityId] : [];
  const { data: entities = [] } = useQuery({
    queryKey: ['ha-states', widget.entityId],
    queryFn: () => fetchStates(entityIds),
    enabled: entityIds.length > 0,
    refetchInterval: 10000,
  });

  const entity = entities[0];
  const [sliderValue, setSliderValue] = useState([50]);

  const statValue = useMemo(() => {
    if (!entity) return '—';
    return entity.state;
  }, [entity]);

  if (widget.type === 'chart') {
    return <EnergyChart />;
  }

  if (widget.type === 'map') {
    return <MapPanel />;
  }

  if (widget.type === 'list') {
    return (
      <ul className="space-y-2 text-xs text-ink/70">
        {entities.length === 0
          ? ['Nessuna entita', 'Aggiungi entity_id', 'Oppure scegli un widget'].map((item) => (
              <li key={item} className="flex items-center justify-between">
                <span>{item}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              </li>
            ))
          : entities.slice(0, 4).map((item) => (
              <li key={item.entity_id} className="flex items-center justify-between">
                <span>{item.entity_id}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-ink/50">
                  {item.state}
                </span>
              </li>
            ))}
      </ul>
    );
  }

  if (widget.type === 'toggle') {
    const checked = entity?.state === 'on';
    return (
      <GlassToggle
        checked={!!checked}
        onCheckedChange={(value) => {
          const domain = getDomain(widget.entityId);
          if (!domain || !widget.entityId) return;
          const service = value ? 'turn_on' : 'turn_off';
          void callService(domain, service, { entity_id: widget.entityId });
        }}
        label={widget.entityId ?? 'Seleziona entita'}
      />
    );
  }

  if (widget.type === 'slider') {
    return (
      <GlassSlider
        value={sliderValue}
        onValueChange={(value) => {
          setSliderValue(value);
          const domain = getDomain(widget.entityId);
          if (!domain || !widget.entityId) return;
          const level = value[0];
          const service =
            domain === 'cover' ? 'set_cover_position' : domain === 'climate' ? 'set_temperature' : 'turn_on';
          const serviceData =
            domain === 'cover'
              ? { entity_id: widget.entityId, position: level }
              : domain === 'climate'
                ? { entity_id: widget.entityId, temperature: level }
                : { entity_id: widget.entityId, brightness_pct: level };
          void callService(domain, service, serviceData);
        }}
        label={widget.entityId ?? 'Seleziona entita'}
      />
    );
  }

  if (widget.type === 'climate') {
    return (
      <div className="space-y-2 text-sm text-ink/70">
        <p className="font-semibold">{widget.entityId ?? 'climate.living_room'}</p>
        <p className="text-3xl font-semibold text-ink">
          {(entity?.attributes?.temperature as string | number | undefined) ??
            entity?.state ??
            '—'}
          °
        </p>
        <p className="text-xs text-ink/50">
          Umidita:{' '}
          {(entity?.attributes?.humidity as string | number | undefined) ?? '—'}%
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-2xl font-semibold">{statValue}</p>
      <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
        {widget.entityId ?? 'Seleziona entita'}
      </p>
    </div>
  );
}
