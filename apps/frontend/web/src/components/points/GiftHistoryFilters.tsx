'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { GiftHistoryFilter } from '@/types/points/points';

const filters: { value: GiftHistoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
];

export default function GiftHistoryFilters() {
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
      {filters.map((filter) => (
        <Button
          key={filter.value}
          type="button"
          size="sm"
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          onClick={() => setFilter(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
