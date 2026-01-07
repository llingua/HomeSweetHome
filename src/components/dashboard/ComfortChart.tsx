'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { comfortSeries } from '@/lib/data/mockData';

export function ComfortChart() {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={comfortSeries} margin={{ top: 6, right: 12, left: -20, bottom: 0 }}>
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
            dataKey="temp"
            stroke="rgba(120, 200, 255, 0.85)"
            fill="rgba(120, 200, 255, 0.2)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="humidity"
            stroke="rgba(255, 189, 114, 0.85)"
            fill="rgba(255, 189, 114, 0.18)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
