'use client';

import * as Switch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export function GlassToggle({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm font-medium">
      {label && <span>{label}</span>}
      <Switch.Root
        className={cn(
          'h-7 w-12 rounded-full border border-white/40 bg-white/25',
          'data-[state=checked]:bg-white/70 transition',
          'shadow-glass',
        )}
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Switch.Thumb
          className={cn(
            'block h-6 w-6 translate-x-0.5 rounded-full bg-white shadow-glass transition',
            'data-[state=checked]:translate-x-5',
          )}
        />
      </Switch.Root>
    </label>
  );
}
