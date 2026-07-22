'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

export default function ClearFiltersButton() {
  const t = useTranslations('restaurants');
  const { clearFilters } = useRestaurantSearchParams();

  return (
    <Button variant="ghost" size="sm" onClick={clearFilters}>
      {t('clearAll')}
    </Button>
  );
}
