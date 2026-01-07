'use client';

import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { energySeries } from '@/lib/data/mockData';

export function EnergyChart() {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={energySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.35)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.4)" />
          <YAxis tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.4)" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.6)',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="solar"
            stroke="rgba(255, 205, 120, 0.8)"
            fill="rgba(255, 205, 120, 0.25)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="consumption"
            stroke="rgba(99, 209, 255, 0.95)"
            strokeWidth={3}
            dot={{ r: 3, stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="grid"
            stroke="rgba(120, 160, 255, 0.7)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
