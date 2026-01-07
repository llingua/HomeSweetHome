'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassSlider } from '@/components/ui/GlassSlider';
import { GlassToggle } from '@/components/ui/GlassToggle';
import { GlassButton } from '@/components/ui/GlassButton';

export function ControlPanel() {
  const [lights, setLights] = useState(true);
  const [cover, setCover] = useState([40]);
  const [climate, setClimate] = useState([21]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <GlassCard className="space-y-4">
        <GlassToggle checked={lights} onCheckedChange={setLights} label="Luci zona living" />
        <GlassSlider value={cover} onValueChange={setCover} label="Tapparelle" />
        <GlassSlider value={climate} onValueChange={setClimate} label="Clima" />
      </GlassCard>
      <GlassCard className="space-y-3">
        <p className="text-sm font-semibold">Scene rapide</p>
        <div className="flex flex-wrap gap-2">
          {['Focus', 'Relax', 'Energia', 'Notte'].map((scene) => (
            <GlassButton key={scene} tone="ghost" className="px-3 py-1 text-xs">
              {scene}
            </GlassButton>
          ))}
        </div>
        <p className="text-xs text-ink/60">Personalizza scorciatoie e automazioni.</p>
      </GlassCard>
    </div>
  );
}
