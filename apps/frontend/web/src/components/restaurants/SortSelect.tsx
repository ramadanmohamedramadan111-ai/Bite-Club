'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

const sortOptions = [
  { value: 'rating', label: 'Rating' },
  { value: 'name', label: 'Alphabetical' },
] as const;

type SortValue = (typeof sortOptions)[number]['value'];

type Props = {
  value: SortValue;
};

export default function SortSelect({ value }: Props) {
  const { setParam } = useRestaurantSearchParams();

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        setParam('sort', next === 'rating' ? null : next)
      }>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

