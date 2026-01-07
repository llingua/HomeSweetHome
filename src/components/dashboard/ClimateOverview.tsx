import { GlassCard } from '@/components/ui/GlassCard';
import { climateZones } from '@/lib/data/mockData';

export function ClimateOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {climateZones.map((zone) => (
        <GlassCard key={zone.name} className="space-y-2">
          <p className="text-sm font-semibold">{zone.name}</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-semibold">{zone.temperature}°</p>
            <p className="text-xs text-ink/60">{zone.humidity}% umidita</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
