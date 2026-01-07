import { GlassPanel } from '@/components/ui/GlassPanel';
import { HeaderBar } from '@/components/dashboard/HeaderBar';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { SceneCards } from '@/components/dashboard/SceneCards';
import { ClimateOverview } from '@/components/dashboard/ClimateOverview';
import { DeviceListVirtual } from '@/components/dashboard/DeviceListVirtual';
import { MapPanel } from '@/components/dashboard/MapPanel';
import { GlassCard } from '@/components/ui/GlassCard';
import { LegacyGroupTabs } from '@/components/legacy/LegacyRegistry';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ComfortChart } from '@/components/dashboard/ComfortChart';

export default function Home() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <HeaderBar />
      <QuickStats />

      <GlassPanel className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Energia in tempo reale</h2>
          <p className="text-sm text-ink/70">
            Visualizza i consumi, i picchi e la produzione solare con rendering fluido.
          </p>
          <EnergyChart />
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassCard className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Picco oggi</p>
                <p className="text-xl font-semibold">4.9 kW</p>
              </div>
              <span className="rounded-full bg-white/50 px-3 py-1 text-xs font-semibold">+8%</span>
            </GlassCard>
            <GlassCard className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Batteria</p>
                <p className="text-xl font-semibold">76%</p>
              </div>
              <span className="rounded-full bg-emerald-200/60 px-3 py-1 text-xs font-semibold">
                2h 10m
              </span>
            </GlassCard>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Pannello rapido</h3>
          <ControlPanel />
        </div>
      </GlassPanel>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <GlassPanel className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Scene e zone</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Automazioni</span>
          </div>
          <SceneCards />
          <ClimateOverview />
          <GlassCard className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Comfort</p>
            <ComfortChart />
          </GlassCard>
        </GlassPanel>
        <GlassPanel className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Mappe</p>
            <h2 className="text-lg font-semibold">Posizionamento dispositivi</h2>
          </div>
          <MapPanel />
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassCard>
              <p className="text-xs text-ink/60">Gateway attivi</p>
              <p className="text-lg font-semibold">6</p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs text-ink/60">Ping medio</p>
              <p className="text-lg font-semibold">38 ms</p>
            </GlassCard>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Data heavy</p>
          <h2 className="text-xl font-semibold">Sensori virtualizzati</h2>
        </div>
        <DeviceListVirtual />
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Copertura componenti</p>
          <h2 className="text-xl font-semibold">Catalogo ha-fusion ricreato</h2>
          <p className="text-sm text-ink/70">
            Tab dedicato a ogni gruppo, pronto per l’estensione con logica HA reale.
          </p>
        </div>
        <LegacyGroupTabs />
      </GlassPanel>
    </main>
  );
}
