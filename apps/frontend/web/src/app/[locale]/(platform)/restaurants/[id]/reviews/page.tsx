import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
  getRestaurantById,
  getReviewsByRestaurantId,
} from '@/data/restaurant-details';
import RestaurantReviewCard from '@/components/restaurants/RestaurantReviewCard';
import RestaurantsPagination from '@/components/restaurants/RestaurantPagination';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 5;

export default async function RestaurantReviewsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { page = '1' } = await searchParams;
  const restaurantId = Number(id);
  const restaurant = getRestaurantById(restaurantId);

  if (!restaurant) {
    notFound();
  }

  const reviews = getReviewsByRestaurantId(restaurantId);
  const currentPage = Number(page);
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedReviews = reviews.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">
          {restaurant.reviewsCount} total reviews · Average rating{' '}
          {restaurant.rating}
        </p>
      </div>

      {paginatedReviews.length > 0 ? (
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <RestaurantReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No reviews yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to leave a review.
          </p>
        </div>
      )}

      {reviews.length > PAGE_SIZE && (
        <div className="flex justify-center pt-4">
          <Suspense fallback={null}>
            <RestaurantsPagination
              currentPage={safePage}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
