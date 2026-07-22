'use client';

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

type Props = {
  categories: string[];
  selected: string[];
};

export default function CategoryFilter({ categories, selected }: Props) {
  const t = useTranslations('restaurants');
  const { toggleCategory } = useRestaurantSearchParams();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{t('categories')}</p>
      <div className="space-y-2">
        {categories.map((category) => {
          const id = `category-${category}`;
          const isChecked = selected.includes(category);

          return (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={isChecked}
                onCheckedChange={() => toggleCategory(category, selected)}
              />
              <Label htmlFor={id} className="font-normal">
                {category}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
