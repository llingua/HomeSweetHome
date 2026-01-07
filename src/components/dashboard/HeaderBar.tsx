import { GlassButton } from '@/components/ui/GlassButton';

export function HeaderBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-ink/50">HomeSweetHome</p>
        <h1 className="text-3xl font-semibold">Dashboard Principale</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-ink/50">
          <span className="rounded-full bg-white/50 px-3 py-1">Ultimo sync 2 min</span>
          <span className="rounded-full bg-white/40 px-3 py-1">Casa · Online</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <GlassButton tone="ghost">Scenario</GlassButton>
        <GlassButton tone="accent">Nuovo widget</GlassButton>
      </div>
    </div>
  );
}
