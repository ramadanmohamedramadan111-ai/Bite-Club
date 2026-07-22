import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SearchForm() {
  const t = useTranslations('restaurants');
  return (
    <form action="/restaurants" method="GET" className="w-full max-w-md">
      <div className="relative">
        <Input
          name="search"
          type="search"
          placeholder={t('searchPlaceholder')}
          className="md:pr-10 pr-0"
        />

        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2 md:flex hidden">
          <SearchIcon className="size-4" />
          <span className="sr-only">{t('searchPlaceholder')}</span>
        </Button>
      </div>
    </form>
  );
}

