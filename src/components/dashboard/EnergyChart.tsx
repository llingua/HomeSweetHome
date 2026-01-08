'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardWidget } from '@/lib/dashboardConfig';

type HistorySeries = {
  id: string;
  name: string;
  points: Array<{ time: string; value: number }>;
};

const chartColors = [
  'rgba(99, 209, 255, 0.95)',
  'rgba(255, 205, 120, 0.8)',
  'rgba(120, 160, 255, 0.7)',
  'rgba(118, 234, 166, 0.9)',
  'rgba(255, 140, 140, 0.85)',
];

export function EnergyChart({ widget }: { widget: DashboardWidget }) {
  const entityIds =
    widget.chartEntityIds && widget.chartEntityIds.length > 0
      ? widget.chartEntityIds
      : widget.entityId
        ? [widget.entityId]
        : [];
  const rangeHours = widget.chartRangeHours ?? 24;
  const mode = widget.chartMode ?? 'history';
  const { data } = useQuery({
    queryKey: ['ha-chart', mode, entityIds.join(','), rangeHours],
    queryFn: async () => {
      const endpoint =
        mode === 'forecast'
          ? `/api/ha/forecast?ids=${encodeURIComponent(entityIds.join(','))}`
          : `/api/ha/history?ids=${encodeURIComponent(entityIds.join(','))}&rangeHours=${rangeHours}`;
      const response = await fetch(endpoint);
      const payload = await response.json();
      return payload.series as HistorySeries[];
    },
    enabled: entityIds.length > 0,
    refetchInterval: 60000,
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    const rows = new Map<number, { time: number } & Record<string, number>>();
    data.forEach((series) => {
      series.points.forEach((point) => {
        const timestamp = new Date(point.time).getTime();
        if (!Number.isFinite(timestamp)) return;
        const row = rows.get(timestamp) ?? { time: timestamp };
        row[series.id] = point.value;
        rows.set(timestamp, row);
      });
    });
    return Array.from(rows.entries())
      .sort((a, b) => a[0] - b[0])
      .map((entry) => ({ time: entry[0], ...entry[1] }));
  }, [data]);

  const yDomain = useMemo(() => {
    if (!data || chartData.length === 0) return undefined;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    chartData.forEach((row) => {
      data.forEach((series) => {
        const value = row[series.id];
        if (typeof value !== 'number' || !Number.isFinite(value)) return;
        min = Math.min(min, value);
        max = Math.max(max, value);
      });
    });
    if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
    if (min === max) {
      const padding = Math.max(1, Math.abs(min) * 0.1);
      return [min - padding, max + padding] as [number, number];
    }
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding] as [number, number];
  }, [chartData, data]);

  if (entityIds.length === 0) {
    return <p className="text-sm text-ink/60">Aggiungi una o piu entita per il grafico.</p>;
  }

  if (!data || chartData.length === 0) {
    return <p className="text-sm text-ink/60">Nessun dato disponibile per il periodo selezionato.</p>;
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.35)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            stroke="rgba(0,0,0,0.4)"
            tickFormatter={(value) =>
              new Date(value as number).toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
          />
          <YAxis tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.4)" domain={yDomain} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.6)',
              fontSize: 12,
            }}
            labelFormatter={(value) =>
              new Date(value as number).toLocaleString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })
            }
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            formatter={(value) => (
              <span className="text-[10px] uppercase tracking-[0.2em] text-ink/60">{value}</span>
            )}
          />
          {data.map((series, index) => (
            <Line
              key={series.id}
              type="monotone"
              dataKey={series.id}
              name={series.name}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={index === 0 ? 3 : 2}
              dot={index === 0 ? { r: 3, stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2 } : false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
