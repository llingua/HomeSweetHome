'use client';

import * as Slider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export function GlassSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      {label && <p className="text-xs uppercase tracking-[0.2em] text-ink/70">{label}</p>}
      <Slider.Root
        className="relative flex h-7 w-full items-center"
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="relative h-2 w-full rounded-full bg-white/35">
          <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-sky-300/80 to-amber-200/80 shadow-glow" />
        </Slider.Track>
        <Slider.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border border-white/50 bg-white/90 shadow-glass',
          )}
        />
      </Slider.Root>
    </div>
  );
}
