'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

const filters = [
  { key: 'delivery', label: 'Delivery' },
  { key: 'pickup', label: 'Pickup' },
  { key: 'creditCard', label: 'Credit Card' },
  { key: 'favorite', label: 'Favorites only' },
] as const;

type FilterKey = (typeof filters)[number]['key'];

type Props = {
  values: Record<FilterKey, boolean>;
};

export default function RestaurantFilters({ values }: Props) {
  const { setBooleanParam } = useRestaurantSearchParams();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Options</p>
      <div className="space-y-2">
        {filters.map((filter) => {
          const id = `filter-${filter.key}`;

          return (
            <div key={filter.key} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={values[filter.key]}
                onCheckedChange={(checked) =>
                  setBooleanParam(filter.key, checked === true)
                }
              />
              <Label htmlFor={id} className="font-normal">
                {filter.label}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
