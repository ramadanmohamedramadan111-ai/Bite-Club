import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import type { MenuItem } from '@/types/restaurant/restaurant';

import { getRestaurantById } from '@/data/restaurant-details';
import { getRestaurantListItemById } from '@/data/mock-restaurants';

type Props = {
  item: MenuItem;
};

function getRestaurantName(restaurantId: number) {
  return (
    getRestaurantById(restaurantId)?.name ??
    getRestaurantListItemById(restaurantId)?.name ??
    'Restaurant'
  );
}

export default function FavoriteItemCard({ item }: Props) {
  const restaurantName = getRestaurantName(item.restaurantId);

  return (
    <Link href={`/items/${item.id}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-40 w-full">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
          {!item.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-background px-3 py-1 text-xs font-medium">
                Unavailable
              </span>
            </div>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{restaurantName}</p>
          <p className="text-sm font-medium">{item.price.toFixed(2)} EGP</p>
        </CardContent>
      </Card>
    </Link>
  );
}
