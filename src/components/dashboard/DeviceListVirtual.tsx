'use client';

import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { devices } from '@/lib/data/mockData';

export function DeviceListVirtual() {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'Tutti' | 'OK' | 'Allerta'>('Tutti');

  const filteredDevices = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return devices.filter((device) => {
      const matchesQuery = normalized.length === 0 || device.name.toLowerCase().includes(normalized);
      const matchesFilter = filter === 'Tutti' || device.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  const rowVirtualizer = useVirtualizer({
    count: filteredDevices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="w-full rounded-full border border-white/50 bg-white/70 px-4 py-2 text-xs sm:w-auto sm:flex-1"
          placeholder="Cerca sensori"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex gap-2">
          {(['Tutti', 'OK', 'Allerta'] as const).map((label) => (
            <button
              key={label}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                filter === label ? 'bg-white/80 text-ink' : 'bg-white/30 text-ink/70'
              }`}
              onClick={() => setFilter(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={parentRef} className="h-64 overflow-auto rounded-2xl bg-white/25 p-2 scrollbar-thin">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const device = filteredDevices[virtualRow.index];

            return (
              <div
                key={device.id}
                className="absolute left-0 right-0 flex items-center justify-between rounded-xl px-3 text-xs"
                style={{
                  top: 0,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div>
                  <p className="font-semibold">{device.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40">{device.value}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    device.status === 'OK'
                      ? 'bg-emerald-400/60 text-ink'
                      : 'bg-amber-200/70 text-ink'
                  }`}
                >
                  {device.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
