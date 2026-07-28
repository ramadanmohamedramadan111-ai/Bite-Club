import React from 'react';
import { Bold } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 w-fit select-none mb-2">
      <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-600 text-primary-foreground shadow-[0_3px_10px_-3px_var(--color-primary)]">
        <Bold className="size-5" />
      </div>
      <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
        BiteClub
      </span>
    </Link>
  );
}
