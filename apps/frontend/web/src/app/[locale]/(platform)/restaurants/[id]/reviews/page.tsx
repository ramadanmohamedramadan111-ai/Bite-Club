import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import {
  getRestaurantById,
  getReviewsByRestaurantId,
} from '@/lib/const-data';
import RestaurantReviewCard from '@/components/restaurants/RestaurantReviewCard';
import RestaurantsPagination from '@/components/restaurants/RestaurantPagination';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import {
  RestaurantReview,
  RestaurantType,
} from '@/types/restaurant/restaurant';
import { buildQueryString } from '@/utils/api-helpers';
import AppPagination from '@/components/shared/AppPagination';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; per_page?: string }>;
};

export default async function RestaurantReviewsPage({
  params,
  searchParams,
}: PageProps) {
  const t = await getTranslations('restaurants');
  const { id } = await params;
  const { page = '1', per_page = '5' } = await searchParams;

  const data = await serverFetch<ApiResponse<RestaurantType>>(
    `/user/restaurants/${id}`,
  );

  const restaurant = data.data;

  const query = buildQueryString({
    page,
    per_page,
  });

  const reviewsData = await serverFetch<
    ApiResponse<PaginatedResponse<RestaurantReview>>
  >(`/user/restaurants/${id}/reviews${query}`);

  const { items: reviews, meta } = reviewsData.data;

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('reviewsTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('reviewsDesc', { total: restaurant.reviews_count, rating: restaurant.average_rating })}
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <RestaurantReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">{t('noReviews')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('beFirstReview')}
          </p>
        </div>
      )}

      <AppPagination
        currentPage={meta.current_page}
        totalPages={meta.last_page}
      />
    </div>
  );
}

