import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import RestaurantReviewCard from '@/components/restaurants/RestaurantReviewCard';
import RestaurantReviewsClient from '@/components/restaurants/RestaurantReviewsClient';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { RestaurantReview, RestaurantType, RestaurantReviewUser } from '@/types/restaurant';
import { buildQueryString } from '@/utils/api-helpers';
import AppPagination from '@/components/shared/AppPagination';
import { parseSearchParams, PaginatedParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';
import { Separator } from '@/components/ui/separator';

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
  const raw = await searchParams;
  const parsed = parseSearchParams(PaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  
  // Default to 10 reviews per page as requested by user
  const { page = '1', per_page = '10' } = parsed.data;

  const data = await serverFetch<ApiResponse<RestaurantType>>(
    `/user/restaurants/${id}`,
  );

  const restaurant = data.data;

  if (!restaurant) {
    notFound();
  }

  // Get token for authentication check
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || null;

  // Fetch my review if logged in
  let myReview: RestaurantReviewUser | null = null;
  if (token) {
    try {
      const myReviewResponse = await serverFetch<ApiResponse<RestaurantReviewUser>>(
        `/user/restaurants/${id}/reviews/me`,
      );
      if (myReviewResponse.success && myReviewResponse.data) {
        myReview = myReviewResponse.data;
      }
    } catch (e) {
      console.error('Failed to fetch user review', e);
    }
  }

  const query = buildQueryString({
    page,
    per_page,
  });

  const reviewsData = await serverFetch<
    ApiResponse<PaginatedResponse<RestaurantReview>>
  >(`/user/restaurants/${id}/reviews${query}`);

  const { items: reviews, meta } = reviewsData.data;

  // Filter out my review if it is included in the paginated reviews list
  const otherReviews = reviews.filter(
    (review) => !myReview || review.id !== myReview.id,
  );

  return (
    <div className="space-y-6">
      {/* Interactive User Review Section */}
      <RestaurantReviewsClient
        restaurantId={Number(id)}
        isAuthenticated={!!token}
        myReview={myReview}
      />

      <Separator className="border-border/40" />

      {/* Reviews Header Info */}
      <div>
        <h2 className="text-xl font-bold text-foreground">{t('reviewsTitle')}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('reviewsDesc', {
            total: restaurant.reviews_count,
            rating: restaurant.average_rating,
          })}
        </p>
      </div>

      {/* Other Reviews List */}
      {otherReviews.length > 0 ? (
        <div className="space-y-4">
          {otherReviews.map((review) => (
            <RestaurantReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-8 text-center bg-muted/20">
          <p className="font-semibold text-sm text-muted-foreground">{t('noReviews')}</p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            {t('beFirstReview')}
          </p>
        </div>
      )}

      {/* Pagination */}
      <AppPagination
        currentPage={meta.current_page}
        totalPages={meta.last_page}
      />
    </div>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await serverFetch<ApiResponse<RestaurantType>>(`/user/restaurants/${id}`);
    const restaurant = res?.data;
    if (restaurant) {
      return {
        title: `${restaurant.name} Reviews | Bite Club`,
        description: `Read customer reviews and ratings for ${restaurant.name} on Bite Club.`,
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: "Restaurant Reviews | Bite Club",
  };
}
