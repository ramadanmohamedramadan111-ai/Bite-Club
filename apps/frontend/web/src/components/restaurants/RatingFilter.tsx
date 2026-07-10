'use client';

import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useRestaurantSearchParams } from './useRestaurantSearchParams';

type Props = {
  value: number;
};

export default function RatingFilter({ value }: Props) {
  const { setParam } = useRestaurantSearchParams();
  const [rating, setRating] = useState(value);

  const commitRating = (newRating: number) => {
    setParam('minRating', newRating === 0 ? null : newRating.toString());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Minimum Rating</p>
        <span className="text-sm text-muted-foreground">{rating}+</span>
      </div>
      <Slider
        min={0}
        max={5}
        step={0.5}
        value={[rating]}
        onValueChange={(newValue) => setRating(newValue[0])}
        onValueCommit={(newValue) => commitRating(newValue[0])}
      />
    </div>
  );
}
