import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import RestaurantDetailHeader from '@/components/restaurants/RestaurantDetailHeader';
import RestaurantDetailTabs from '@/components/restaurants/RestaurantDetailTabs';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantType } from '@/types/restaurant/restaurant';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;

  const data = await serverFetch<ApiResponse<RestaurantType>>(
    `/user/restaurants/${id}`,
  );

  const restaurant = data.data;

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto space-y-6">
      <RestaurantDetailHeader restaurant={restaurant} />
      <Suspense
        fallback={<div className="h-10 animate-pulse rounded-lg bg-muted" />}>
        <RestaurantDetailTabs restaurantId={restaurant.id} />
      </Suspense>
      {children}
    </div>
  );
}

