'use client';

import { useTranslations } from 'next-intl';

export function GlobalLoader() {
  const tc = useTranslations('common');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer rotating gradient border */}
        <div className="h-16 w-16 rounded-full border-2 border-transparent border-t-primary border-r-orange-500 animate-spin" />
      </div>
      
      {/* Decorative text */}
      <h3 className="mt-6 text-sm font-bold tracking-wide text-foreground uppercase animate-pulse">
        BiteClub
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground font-medium animate-pulse">
        {tc('loading') || 'Loading...'}
      </p>
    </div>
  );
}
