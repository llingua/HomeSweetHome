import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { scenes } from '@/lib/data/mockData';

export function SceneCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {scenes.map((scene) => (
        <GlassCard key={scene.name} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{scene.name}</p>
            <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
              {scene.status}
            </span>
          </div>
          <GlassButton tone={scene.tone as 'primary' | 'ghost' | 'accent'}>
            Attiva
          </GlassButton>
        </GlassCard>
      ))}
    </div>
  );
}
