import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getRestaurantById } from '@/data/restaurant-details';
import RestaurantDetailHeader from '@/components/restaurants/RestaurantDetailHeader';
import RestaurantDetailTabs from '@/components/restaurants/RestaurantDetailTabs';
import RestaurantMenuView from '@/components/restaurants/RestaurantMenuView';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function RestaurantDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  const restaurantId = Number(id);
  const restaurant = getRestaurantById(restaurantId);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto space-y-6">
      <RestaurantDetailHeader restaurant={restaurant} />
      <Suspense
        fallback={<div className="h-10 animate-pulse rounded-lg bg-muted" />}>
        <RestaurantDetailTabs restaurantId={restaurantId} />
      </Suspense>
      {children}
    </div>
  );
}

export async function generateStaticParams() {
  return [{ id: '4' }];
}

