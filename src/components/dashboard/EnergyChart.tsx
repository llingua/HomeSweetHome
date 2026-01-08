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

function withAlpha(color: string, alpha: number) {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex = color.length === 4
      ? `${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color.slice(1);
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  if (color.startsWith('rgba(')) return color;
  return color;
}

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
          ? `api/ha/forecast?ids=${encodeURIComponent(entityIds.join(','))}`
          : `api/ha/history?ids=${encodeURIComponent(entityIds.join(','))}&rangeHours=${rangeHours}`;
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
    const latestByBucket = new Map<number, Record<string, number>>();
    const stepMinutes =
      mode === 'forecast' ? null : rangeHours <= 6 ? 30 : rangeHours <= 24 ? 60 : null;
    const stepMs = stepMinutes ? stepMinutes * 60 * 1000 : null;
    data.forEach((series) => {
      series.points.forEach((point) => {
        const timestamp = new Date(point.time).getTime();
        if (!Number.isFinite(timestamp)) return;
        const bucketTime = stepMs ? Math.round(timestamp / stepMs) * stepMs : timestamp;
        const bucketLatest = latestByBucket.get(bucketTime) ?? {};
        const lastSeen = bucketLatest[series.id];
        if (lastSeen === undefined || timestamp >= lastSeen) {
          bucketLatest[series.id] = timestamp;
          latestByBucket.set(bucketTime, bucketLatest);
          const row = rows.get(bucketTime) ?? { time: bucketTime };
          row[series.id] = point.value;
          rows.set(bucketTime, row);
        }
      });
    });
    return Array.from(rows.values()).sort((a, b) => a.time - b.time);
  }, [data, mode, rangeHours]);

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

  const xTickConfig = useMemo(() => {
    if (mode === 'forecast') {
      return {
        ticks: undefined as number[] | undefined,
        formatter: (value: number) =>
          new Date(value).toLocaleString('it-IT', { day: '2-digit', month: '2-digit' }),
      };
    }

    const stepMinutes = rangeHours <= 6 ? 30 : 60;
    const formatter =
      rangeHours <= 24
        ? (value: number) =>
            new Date(value).toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
            })
        : (value: number) =>
            new Date(value).toLocaleString('it-IT', { day: '2-digit', month: '2-digit' });

    if (chartData.length === 0) {
      return { ticks: undefined as number[] | undefined, formatter };
    }

    const times = chartData.map((row) => row.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const stepMs = stepMinutes * 60 * 1000;
    const firstTick = minTime;
    const ticks: number[] = [];
    const maxTicks =
      rangeHours <= 6 ? 12 : rangeHours <= 12 ? 12 : rangeHours <= 24 ? 24 : 12;
    for (let t = firstTick; t <= maxTime; t += stepMs) {
      ticks.push(t);
      if (rangeHours <= 24 && ticks.length >= maxTicks) break;
    }

    return { ticks, formatter };
  }, [chartData, mode, rangeHours]);

  const formatValueWithUnit = useMemo(() => {
    return (value: number) => {
      if (!Number.isFinite(value)) return '';
      const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
      return widget.unit ? `${formatted} ${widget.unit}` : formatted;
    };
  }, [widget.unit]);

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
            tickFormatter={(value) => xTickConfig.formatter(value as number)}
            ticks={xTickConfig.ticks}
            type="number"
            scale="time"
            domain={['auto', 'auto']}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="rgba(0,0,0,0.4)"
            domain={yDomain}
            tickFormatter={formatValueWithUnit}
          />
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
            formatter={(value) => formatValueWithUnit(Number(value))}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            formatter={(value) => (
              <span className="text-[10px] uppercase tracking-[0.2em] text-ink/60">{value}</span>
            )}
          />
          {data.map((series, index) => {
            const customColor = widget.chartEntityColors?.[series.id];
            const strokeColor = customColor
              ? withAlpha(customColor, 0.9)
              : chartColors[index % chartColors.length];
            return (
              <Line
                key={series.id}
                type="monotone"
                dataKey={series.id}
                name={widget.chartEntityLabels?.[series.id] ?? series.name}
                stroke={strokeColor}
                strokeWidth={index === 0 ? 3 : 2}
                dot={
                  index === 0 ? { r: 3, stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2 } : false
                }
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
