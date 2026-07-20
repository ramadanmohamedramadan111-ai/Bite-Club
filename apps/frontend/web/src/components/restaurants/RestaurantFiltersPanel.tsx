import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AvailabilityFilter from './AvailabilityFilter';
import CategoryFilter from './CategoryFilter';
import RatingFilter from './RatingFilter';
import RestaurantFilters from './RestaurantsFilter';
import ClearFiltersButton from './ClearFiltersButton';

type Props = {
  categories: string[];
  values: {
    selectedCategories: string[];
    minRating: number;
    delivery: boolean;
    pickup: boolean;
    availableOnly: boolean;
  };
};

export default function RestaurantFiltersPanel({ categories, values }: Props) {
  const hasActiveFilters =
    values.selectedCategories.length > 0 ||
    values.minRating > 0 ||
    values.delivery ||
    values.pickup ||
    values.availableOnly;

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Filters</CardTitle>
        {hasActiveFilters && <ClearFiltersButton />}
      </CardHeader>
      <CardContent className="space-y-6">
        <CategoryFilter
          categories={categories}
          selected={values.selectedCategories}
        />

        <Separator />

        <RatingFilter key={values.minRating} value={values.minRating} />

        <Separator />

        <RestaurantFilters
          values={{
            delivery: values.delivery,
            pickup: values.pickup,
          }}
        />

        <Separator />

        <AvailabilityFilter checked={values.availableOnly} />
      </CardContent>
    </Card>
  );
}

