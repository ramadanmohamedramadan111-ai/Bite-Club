import { notFound } from 'next/navigation';
import { ArrowLeft, Store } from 'lucide-react';
import { getMenuItemById, getRestaurantById } from '@/data/restaurant-details';
import { Link } from '@/i18n/navigation';
import MenuItemCustomizer from '@/components/restaurants/MenuItemCustomizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MenuItemPage({ params }: PageProps) {
  const { id } = await params;
  const itemId = Number(id);
  const item = getMenuItemById(itemId);

  if (!item) {
    notFound();
  }

  const restaurant = getRestaurantById(item.restaurantId);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto  space-y-6 ">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" className="w-fit gap-2">
          <Link href={`/restaurants/${restaurant.id}`}>
            <ArrowLeft className="size-4" />
            Back to menu
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-fit gap-2">
          <Link href={`/restaurants/${restaurant.id}`}>
            <Store className="size-4" />
            {restaurant.name}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="">
          <MenuItemCustomizer
            key={item.id}
            item={item}
            variant="page"
            restaurant={restaurant}
            cartType="individual"
            orderingContext="restaurant"
          />
        </CardContent>
      </Card>
    </div>
  );
}

