import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type GlassPanelProps = React.ComponentPropsWithoutRef<'div'>;

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'glass-panel liquid-surface rounded-3xl p-6 shadow-glass backdrop-blur-glass',
        'glass-grid',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
