import { Suspense } from 'react';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import RestaurantFiltersPanel from '@/components/restaurants/RestaurantFiltersPanel';
import RestaurantsPagination from '@/components/restaurants/RestaurantPagination';
import RestaurantSearch from '@/components/restaurants/RestaurantSearch';
import SortSelect from '@/components/restaurants/SortSelect';
import { mockRestaurants } from '@/data/mock-restaurants';
import { restaurantCategories } from '@/data/restaurant-categories';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
    minRating?: string;
    delivery?: string;
    pickup?: string;
    creditCard?: string;
    favorite?: string;
    availableOnly?: string;
    search?: string;
    sort?: string;
  }>;
};

const categories = [...restaurantCategories];

const restaurants = mockRestaurants;

const PAGE_SIZE = 8;

type SortOption = 'rating' | 'name' | 'deliveryTime' | 'deliveryPrice';

function sortRestaurants(
  items: typeof restaurants,
  sort: SortOption,
): typeof restaurants {
  const sorted = [...items];

  switch (sort) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'deliveryTime':
      return sorted.sort((a, b) => a.minDeliveryTime - b.minDeliveryTime);
    case 'deliveryPrice':
      return sorted.sort((a, b) => a.minDeliveryPrice - b.minDeliveryPrice);
    case 'rating':
    default:
      return sorted.sort((a, b) => b.rating - a.rating);
  }
}

export default async function Page({ searchParams }: PageProps) {
  const {
    page = '1',
    category = '',
    minRating = '0',
    delivery,
    pickup,
    creditCard,
    favorite,
    availableOnly,
    search = '',
    sort = 'rating',
  } = await searchParams;

  const minimumRating = Number(minRating);
  const currentPage = Number(page);
  const selectedCategories = category
    ? category.split(',').filter(Boolean)
    : [];
  const sortOption = (sort as SortOption) || 'rating';
  const normalizedSearch = search.trim().toLowerCase();

  const filteredRestaurants = sortRestaurants(
    restaurants.filter((restaurant) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.some((item) => restaurant.categories.includes(item));

      const ratingMatch = restaurant.rating >= minimumRating;

      const deliveryMatch = delivery !== 'true' || restaurant.delivery;
      const pickupMatch = pickup !== 'true' || restaurant.pickup;
      const creditCardMatch = creditCard !== 'true' || restaurant.creditCard;
      const favoriteMatch = favorite !== 'true' || restaurant.isFavorite;
      const availableMatch = availableOnly !== 'true' || restaurant.isAvailable;

      const searchMatch =
        !normalizedSearch ||
        restaurant.name.toLowerCase().includes(normalizedSearch);

      return (
        categoryMatch &&
        ratingMatch &&
        deliveryMatch &&
        pickupMatch &&
        creditCardMatch &&
        favoriteMatch &&
        availableMatch &&
        searchMatch
      );
    }),
    sortOption,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRestaurants.length / PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRestaurants = filteredRestaurants.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

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
                    <SortSelect value={sortOption} />
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
                categories={categories}
                values={{
                  selectedCategories,
                  minRating: minimumRating,
                  delivery: delivery === 'true',
                  pickup: pickup === 'true',
                  creditCard: creditCard === 'true',
                  favorite: favorite === 'true',
                  availableOnly: availableOnly === 'true',
                }}
              />
            </div>
          </Suspense>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredRestaurants.length} restaurant
            {filteredRestaurants.length === 1 ? '' : 's'}
          </p>

          {paginatedRestaurants.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedRestaurants.map((restaurant) => (
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

          {filteredRestaurants.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Suspense fallback={null}>
                <RestaurantsPagination
                  currentPage={safePage}
                  totalPages={totalPages}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

