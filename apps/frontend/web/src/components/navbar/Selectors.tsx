'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Selectors() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLocaleToggle = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="my-6 flex items-center justify-center gap-3 select-none">
      {/* Language AR/EN Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLocaleToggle}
        className="h-9 px-3.5 rounded-xl font-bold text-xs uppercase text-muted-foreground hover:text-foreground hover:bg-accent/40 cursor-pointer shadow-3xs border border-border/20">
        {locale === 'ar' ? 'English' : 'العربية'}
      </Button>

      <div className="w-px h-4.5 bg-border/60 shrink-0" />

      {/* Theme Sun/Moon Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleThemeToggle}
        className="relative h-9 w-9 rounded-xl cursor-pointer hover:bg-accent/40 text-muted-foreground hover:text-foreground shadow-3xs border border-border/20">
        <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle Theme</span>
      </Button>
    </div>
  );
}
