import { cn } from '@/lib/utils';

export function GlassPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'glass-panel liquid-surface rounded-3xl p-6 shadow-glass backdrop-blur-glass',
        'glass-grid',
        className,
      )}
    >
      {children}
    </div>
  );
}
