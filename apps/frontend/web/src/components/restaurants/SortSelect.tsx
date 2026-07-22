'use client';

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

type SortValue = (typeof sortOptions)[number]['value'];

type Props = {
  value: SortValue;
};

export default function SortSelect({ value }: Props) {
  const t = useTranslations('restaurants');
  const { setParam } = useRestaurantSearchParams();

  const sortOptions = [
    { value: 'rating', label: t('rating') },
    { value: 'name', label: t('alphabetical') },
  ] as const;

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        setParam('sort', next === 'rating' ? null : next)
      }>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder={t('sortBy')} />
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

