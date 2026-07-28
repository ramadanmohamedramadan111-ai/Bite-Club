'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export default function SearchUsers() {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  const [debouncedValue] = useDebounce(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedValue) {
      params.set('search', debouncedValue);
    } else {
      params.delete('search');
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedValue]);

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
      <Input
        name="search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('search')}
        className="pl-9 h-10 rounded-xl"
      />
    </div>
  );
}
