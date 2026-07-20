'use client';

import { Button } from '@/components/ui/button';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

export default function ClearFiltersButton() {
  const { clearFilters } = useRestaurantSearchParams();

  return (
    <Button variant="ghost" size="sm" onClick={clearFilters}>
      Clear all
    </Button>
  );
}
