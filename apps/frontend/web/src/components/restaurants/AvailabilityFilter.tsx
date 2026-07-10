'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

type Props = {
  checked: boolean;
};

export default function AvailabilityFilter({ checked }: Props) {
  const { setBooleanParam } = useRestaurantSearchParams();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Availability</p>
      <div className="flex items-center gap-2">
        <Checkbox
          id="available-only"
          checked={checked}
          onCheckedChange={(value) =>
            setBooleanParam('availableOnly', value === true)
          }
        />
        <Label htmlFor="available-only" className="font-normal">
          Available only
        </Label>
      </div>
    </div>
  );
}
