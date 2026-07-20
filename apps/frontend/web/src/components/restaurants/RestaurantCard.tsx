import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Bike, Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { RestaurantType } from '@/types/restaurant/restaurant';

type Props = {
  restaurant: RestaurantType;
};

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <Card className={`overflow-hidden transition`}>
      <div className="relative">
        <Link href={`/restaurants/${restaurant.id}`}>
          <Image
            src={restaurant.logo_url}
            alt={restaurant.name}
            width={400}
            height={240}
            className="h-48 w-full object-cover"
          />
        </Link>

        {!restaurant.is_open_now && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-white/50">
            <span className="rounded-full bg-background px-4 py-2 text-sm font-medium">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{restaurant.name}</h3>

          <Heart
            className={`h-5 w-5 ${
              false ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{restaurant.average_rating}</span>
          <span className="text-sm text-muted-foreground">
            ({restaurant.reviews_count} reviews)
          </span>
        </div>

        <div className="flex gap-3">
          {restaurant.delivery_enabled && (
            <Bike className="h-5 w-5 text-muted-foreground" />
          )}
          {restaurant.pickup_enabled && (
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.category && (
            <span
              key={restaurant.category.id}
              className="rounded-full bg-muted px-2 py-1 text-xs">
              {restaurant.category.name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

