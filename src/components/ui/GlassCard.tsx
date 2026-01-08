import { cn } from '@/lib/utils';

type GlassCardProps = React.ComponentPropsWithoutRef<'div'>;

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn('glass-card rounded-2xl p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
