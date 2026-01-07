import { cn } from '@/lib/utils';

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'ghost' | 'accent';
};

export function GlassButton({
  className,
  tone = 'primary',
  type = 'button',
  ...props
}: GlassButtonProps) {
  const toneClass =
    tone === 'accent'
      ? 'bg-white/70 text-ink shadow-glow'
      : tone === 'ghost'
        ? 'bg-white/20 text-ink'
        : 'bg-gradient-to-r from-white/80 to-white/30 text-ink';

  return (
    <button
      className={cn(
        'glass-button rounded-full px-4 py-2 text-sm font-semibold transition',
        'hover:scale-[1.02] active:scale-[0.98]',
        'border border-white/40 backdrop-blur-glass',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
        toneClass,
        className,
      )}
      type={type}
      {...props}
    />
  );
}
