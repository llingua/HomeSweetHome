import { Activity, Shield, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const stats = [
  {
    id: 'energy',
    label: 'Consumo attuale',
    value: '3.4 kW',
    detail: 'Solare 62%',
    icon: Zap,
  },
  {
    id: 'security',
    label: 'Sicurezza',
    value: 'Protetta',
    detail: '2 sensori in allerta',
    icon: Shield,
  },
  {
    id: 'automation',
    label: 'Automazioni',
    value: '14 attive',
    detail: 'Ultima: 2 min fa',
    icon: Activity,
  },
];

export function QuickStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map(({ id, label, value, detail, icon: Icon }) => (
        <GlassCard key={id} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            <p className="text-xs text-ink/60">{detail}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/40">
            <Icon className="h-5 w-5 text-ink/70" />
          </span>
        </GlassCard>
      ))}
    </div>
  );
}
