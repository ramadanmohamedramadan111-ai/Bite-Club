'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

type Props = {
  value: string;
};

export default function RestaurantSearch({ value }: Props) {
  const t = useTranslations('restaurants');
  const [query, setQuery] = useState(value);
  const lastCommittedQuery = useRef(value);
  const { setParam } = useRestaurantSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query === lastCommittedQuery.current) {
        return;
      }

      lastCommittedQuery.current = query;
      setParam('search', query || null);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, setParam]);

  if (value !== lastCommittedQuery.current && value !== query) {
    lastCommittedQuery.current = value;
    setQuery(value);
  }

  return (
    <div className="relative w-full max-w-md">
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
