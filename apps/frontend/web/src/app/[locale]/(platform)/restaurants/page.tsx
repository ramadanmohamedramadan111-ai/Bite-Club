import { Suspense } from 'react';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import RestaurantFiltersPanel from '@/components/restaurants/RestaurantFiltersPanel';
import RestaurantsPagination from '@/components/restaurants/RestaurantPagination';
import RestaurantSearch from '@/components/restaurants/RestaurantSearch';
import SortSelect from '@/components/restaurants/SortSelect';

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

const categories = [
  'Italian',
  'Pizza',
  'Burgers',
  'Fast Food',
  'Asian',
  'Seafood',
  'Desserts',
];

const restaurants = [
  {
    id: 1,
    logo: 'https://picsum.photos/200/200?1',
    isFavorite: false,
    rating: 4.5,
    reviewsCount: 120,
    name: 'Italian House',
    categories: ['Italian', 'Pizza'],
    delivery: true,
    pickup: true,
    creditCard: true,
    isAvailable: true,
    minDeliveryTime: 20,
    maxDeliveryTime: 30,
    minDeliveryPrice: 19,
    maxDeliveryPrice: 29,
  },
  {
    id: 2,
    logo: 'https://picsum.photos/200/200?2',
    isFavorite: true,
    rating: 4,
    reviewsCount: 85,
    name: 'Burger Town',
    categories: ['Burgers', 'Fast Food'],
    delivery: true,
    pickup: false,
    creditCard: true,
    isAvailable: false,
    minDeliveryTime: 30,
    maxDeliveryTime: 40,
    minDeliveryPrice: 29,
    maxDeliveryPrice: 39,
  },
  {
    id: 3,
    logo: 'https://picsum.photos/200/200?3',
    isFavorite: false,
    rating: 3.5,
    reviewsCount: 45,
    name: 'Pizza Corner',
    categories: ['Pizza', 'Italian'],
    delivery: false,
    pickup: true,
    creditCard: true,
    isAvailable: true,
    minDeliveryTime: 0,
    maxDeliveryTime: 0,
    minDeliveryPrice: 0,
    maxDeliveryPrice: 0,
  },
  {
    id: 4,
    logo: 'https://picsum.photos/200/200?4',
    isFavorite: true,
    rating: 5,
    reviewsCount: 200,
    name: 'Tokyo Kitchen',
    categories: ['Asian', 'Seafood'],
    delivery: true,
    pickup: false,
    creditCard: false,
    isAvailable: true,
    minDeliveryTime: 35,
    maxDeliveryTime: 45,
    minDeliveryPrice: 39,
    maxDeliveryPrice: 49,
  },
  {
    id: 5,
    logo: 'https://picsum.photos/200/200?5',
    isFavorite: false,
    rating: 4.2,
    reviewsCount: 60,
    name: 'Sweet Spot',
    categories: ['Desserts'],
    delivery: false,
    pickup: true,
    creditCard: false,
    isAvailable: false,
    minDeliveryTime: 0,
    maxDeliveryTime: 0,
    minDeliveryPrice: 0,
    maxDeliveryPrice: 0,
  },
  {
    id: 6,
    logo: 'https://picsum.photos/200/200?6',
    isFavorite: true,
    rating: 4.8,
    reviewsCount: 150,
    name: 'Ocean Catch',
    categories: ['Seafood', 'Asian'],
    delivery: true,
    pickup: true,
    creditCard: true,
    isAvailable: false,
    minDeliveryTime: 25,
    maxDeliveryTime: 35,
    minDeliveryPrice: 39,
    maxDeliveryPrice: 59,
  },
  {
    id: 7,
    logo: 'https://picsum.photos/200/200?7',
    isFavorite: false,
    rating: 3.9,
    reviewsCount: 30,
    name: 'Pasta Palace',
    categories: ['Italian'],
    delivery: true,
    pickup: true,
    creditCard: true,
    isAvailable: false,
    minDeliveryTime: 18,
    maxDeliveryTime: 25,
    minDeliveryPrice: 19,
    maxDeliveryPrice: 39,
  },
  {
    id: 8,
    logo: 'https://picsum.photos/200/200?8',
    isFavorite: true,
    rating: 4.6,
    reviewsCount: 90,
    name: 'Big Burger',
    categories: ['Burgers', 'Fast Food'],
    delivery: true,
    pickup: true,
    creditCard: true,
    isAvailable: true,
    minDeliveryTime: 12,
    maxDeliveryTime: 18,
    minDeliveryPrice: 19,
    maxDeliveryPrice: 29,
  },
  {
    id: 9,
    logo: 'https://picsum.photos/200/200?9',
    isFavorite: false,
    rating: 4.1,
    reviewsCount: 70,
    name: 'Dragon Food',
    categories: ['Asian'],
    delivery: true,
    pickup: true,
    creditCard: true,
    isAvailable: true,
    minDeliveryTime: 24,
    maxDeliveryTime: 32,
    minDeliveryPrice: 29,
    maxDeliveryPrice: 29,
  },
  {
    id: 10,
    logo: 'https://picsum.photos/200/200?10',
    isFavorite: true,
    rating: 4.9,
    reviewsCount: 180,
    name: 'Cheesy Pizza',
    categories: ['Pizza', 'Italian'],
    delivery: true,
    pickup: true,
    creditCard: true,
    isAvailable: false,
    minDeliveryTime: 18,
    maxDeliveryTime: 25,
    minDeliveryPrice: 9,
    maxDeliveryPrice: 19,
  },
];

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
      const availableMatch =
        availableOnly !== 'true' || restaurant.isAvailable;

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
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
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
          </Suspense>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Suspense fallback={<div className="h-9 max-w-md animate-pulse rounded-lg bg-muted" />}>
              <RestaurantSearch value={search} />
            </Suspense>

            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {filteredRestaurants.length} restaurant
                {filteredRestaurants.length === 1 ? '' : 's'}
              </p>
              <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />}>
                <SortSelect value={sortOption} />
              </Suspense>
            </div>
          </div>

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
