'use client';

import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: 'en' | 'ar') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="size-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-40 p-1">
        <div className="flex flex-col">
          <Button
            variant={locale === 'en' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => changeLanguage('en')}>
            🇺🇸 English
          </Button>

          <Button
            variant={locale === 'ar' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => changeLanguage('ar')}>
            🇪🇬 العربية
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

