'use client';

import { useTranslations } from 'next-intl';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

type Props = {
  categories: string[];
  selected: string[];
};

export default function CategoryFilter({ categories, selected }: Props) {
  const t = useTranslations('restaurants');
  const { setParam } = useRestaurantSearchParams();
  
  const currentValue = selected[0] || '';

  const handleToggle = (category: string) => {
    if (currentValue === category) {
      setParam('category', null);
    } else {
      setParam('category', category);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{t('categories')}</p>
      <RadioGroup value={currentValue}>
        <div className="space-y-2">
          {categories.map((category) => {
            const id = `category-${category}`;
            const isChecked = currentValue === category;

            return (
              <div
                key={category}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleToggle(category)}
              >
                <RadioGroupItem
                  id={id}
                  value={category}
                  checked={isChecked}
                  onClick={(e) => {
                    // Prevent default checkbox/radio behavior to let handleToggle control it
                    e.stopPropagation();
                    handleToggle(category);
                  }}
                />
                <Label
                  htmlFor={id}
                  className="font-normal cursor-pointer select-none"
                  onClick={(e) => {
                    // Prevent double firing when clicking label
                    e.preventDefault();
                  }}
                >
                  {category}
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
