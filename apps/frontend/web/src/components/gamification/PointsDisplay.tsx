'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  balance: number;
  className?: string;
  compact?: boolean;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function PointsDisplay({ balance, className, compact }: Props) {
  const t = useTranslations('gamification');
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const duration = 1200;
    const start = performance.now();
    const from = 0;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplayed(Math.round(from + (balance - from) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [balance]);

  const formatted = displayed.toLocaleString();

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <span className="relative">
          <Coins className="size-4 text-amber-500" />
          <span className="absolute -inset-1 rounded-full bg-amber-500/20 blur-sm" />
        </span>
        <span className="text-sm font-bold tabular-nums">{formatted}</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <span className="relative shrink-0">
          <Coins className="size-6 text-amber-500" />
          <span className="absolute -inset-2 rounded-full bg-amber-500/20 blur-md" />
        </span>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{t('pointsLabel')}</span>
          <span
            className={cn(
              'text-2xl font-extrabold tabular-nums tracking-tight bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-300 bg-clip-text text-transparent',
              visible && 'animate-count-up',
            )}>
            {formatted}
          </span>
        </div>
      </div>

      <div className="absolute -top-1 -end-2">
        <SparkleParticle delay={0} />
        <SparkleParticle delay={0.5} className="top-3 end-0" />
        <SparkleParticle delay={1} className="top-1 end-4" />
      </div>
    </div>
  );
}

function SparkleParticle({
  delay,
  className,
}: {
  delay: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'absolute size-1.5 rounded-full bg-yellow-300 opacity-0 animate-sparkle',
        className,
      )}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '1.5s',
      }}
    />
  );
}

