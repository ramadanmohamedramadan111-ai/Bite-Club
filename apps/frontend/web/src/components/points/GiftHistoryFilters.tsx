'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { GiftHistoryFilter } from '@/types/points/points';

const filterKeys: { value: GiftHistoryFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'sent', labelKey: 'sent' },
  { value: 'received', labelKey: 'received' },
];

export default function GiftHistoryFilters() {
  const t = useTranslations('points');
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = (searchParams.get('giftFilter') ??
    'all') as GiftHistoryFilter;

  function setFilter(filter: GiftHistoryFilter) {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === 'all') {
      params.delete('giftFilter');
    } else {
      params.set('giftFilter', filter);
    }

    params.delete('page');
    router.replace(`/points?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filterKeys.map((filter) => (
        <Button
          key={filter.value}
          type="button"
          size="sm"
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          onClick={() => setFilter(filter.value)}
        >
          {t(filter.labelKey)}
        </Button>
      ))}
    </div>
  );
}
