import { Suspense } from 'react';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import RestaurantFiltersPanel from '@/components/restaurants/RestaurantFiltersPanel';
import RestaurantSearch from '@/components/restaurants/RestaurantSearch';
import SortSelect from '@/components/restaurants/SortSelect';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import {
  RestaurantCategory,
  RestaurantType,
} from '@/types/restaurant/restaurant';
import { buildQueryString } from '@/utils/api-helpers';
import AppPagination from '@/components/shared/AppPagination';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
    minRating?: string;
    delivery?: string;
    pickup?: string;
    availableOnly?: string;
    search?: string;
    sort?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const {
    page = '1',
    category = '',
    minRating = '0',
    delivery,
    pickup,
    availableOnly,
    search = '',
    sort = 'rating',
  } = await searchParams;

  const categoriesData = await serverFetch<
    ApiResponse<{ items: RestaurantCategory[] }>
  >('/user/restaurant-categories');
  const categories = categoriesData.data.items || [];

  const backendCategory = category ? category.split(',')[0] : undefined;
  const minRatingNum = Number(minRating);
  const backendMinRating = minRatingNum >= 1 ? minRatingNum : undefined;

  const query = buildQueryString({
    page,
    per_page: '8',
    category: backendCategory,
    min_rating: backendMinRating,
    delivery_enabled: delivery === 'true' ? true : undefined,
    pickup_enabled: pickup === 'true' ? true : undefined,
    accept_orders: availableOnly === 'true' ? true : undefined,
    name: search || undefined,
    sort_by: sort === 'name' ? 'alphabetical' : 'rating',
  });

  const responseData = await serverFetch<
    ApiResponse<PaginatedResponse<RestaurantType>>
  >(`/user/restaurants${query}`);

  const { meta } = responseData.data;

  const restaurants = responseData.data.items || [];
  const totalItems = responseData.data.meta?.total || 0;

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Restaurants</h1>
        <p className="mt-2 text-muted-foreground">
          Discover the best restaurants near you
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse rounded-xl bg-muted" />
            }>
            <div className="sticky top-20 flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Suspense
                    fallback={
                      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
                    }>
                    <div>Sort: </div>
                    <SortSelect value={sort as 'rating' | 'name'} />
                  </Suspense>
                </div>
              </div>

              <Suspense
                fallback={
                  <div className="h-9 max-w-md animate-pulse rounded-lg bg-muted" />
                }>
                <RestaurantSearch value={search} />
              </Suspense>

              <RestaurantFiltersPanel
                categories={categories.map((c) => c.name)}
                values={{
                  selectedCategories: category
                    ? category.split(',').filter(Boolean)
                    : [],
                  minRating: minRatingNum,
                  delivery: delivery === 'true',
                  pickup: pickup === 'true',
                  availableOnly: availableOnly === 'true',
                }}
              />
            </div>
          </Suspense>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {totalItems} restaurant
            {totalItems === 1 ? '' : 's'}
          </p>

          {restaurants.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-lg font-medium">No restaurants found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

          <AppPagination
            currentPage={meta.current_page}
            totalPages={meta.last_page}
          />
        </div>
      </div>
    </div>
  );
}

