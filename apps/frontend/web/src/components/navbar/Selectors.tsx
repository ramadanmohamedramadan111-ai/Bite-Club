'use client';

import { Moon, Sun } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';

import { usePathname, useRouter } from '@/i18n/navigation';
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
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLocaleToggle}
        className="h-9 px-3 rounded-lg font-bold text-xs uppercase text-muted-foreground hover:text-foreground hover:bg-accent/60">
        {locale === 'ar' ? 'EN' : 'العربية'}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleThemeToggle}
        className="relative h-9 w-9 rounded-lg cursor-pointer hover:bg-accent/60">
        <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground hover:text-foreground" />
        <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground hover:text-foreground" />
        <span className="sr-only">Toggle Theme</span>
      </Button>
    </div>
  );
}