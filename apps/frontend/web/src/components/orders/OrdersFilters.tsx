'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import type {
  OrderFulfillmentFilter,
  OrdersTab,
  OrderTypeFilter,
} from '@/types/orders/order';

const statusOptions: { value: OrdersTab; label: string }[] = [
  { value: 'all', label: 'All orders' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const fulfillmentOptions: {
  value: OrderFulfillmentFilter;
  label: string;
}[] = [
  { value: 'all', label: 'All' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
];

const typeOptions: { value: OrderTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'individual', label: 'Individual' },
  { value: 'group', label: 'Group' },
];

type FilterSectionProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function FilterSection<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSectionProps<T>) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <RadioGroup value={value} onValueChange={(next) => onChange(next as T)}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;

          return (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem value={option.value} id={optionId} />
              <Label htmlFor={optionId} className="font-normal">
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}

export default function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'all') as OrdersTab;
  const fulfillment = (searchParams.get('fulfillment') ??
    'all') as OrderFulfillmentFilter;
  const type = (searchParams.get('type') ?? 'all') as OrderTypeFilter;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete('page');
    const query = params.toString();
    router.replace(query ? `/orders?${query}` : '/orders');
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tab');
    params.delete('fulfillment');
    params.delete('type');
    params.delete('page');
    const query = params.toString();
    router.replace(query ? `/orders?${query}` : '/orders');
  }

  const hasActiveFilters =
    tab !== 'all' || fulfillment !== 'all' || type !== 'all';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <FilterSection
          id="status"
          label="Status"
          value={tab}
          options={statusOptions}
          onChange={(value) => updateParam('tab', value)}
        />

        <Separator />

        <FilterSection
          id="fulfillment"
          label="Fulfillment"
          value={fulfillment}
          options={fulfillmentOptions}
          onChange={(value) => updateParam('fulfillment', value)}
        />

        <Separator />

        <FilterSection
          id="type"
          label="Order type"
          value={type}
          options={typeOptions}
          onChange={(value) => updateParam('type', value)}
        />
      </CardContent>
    </Card>
  );
}
