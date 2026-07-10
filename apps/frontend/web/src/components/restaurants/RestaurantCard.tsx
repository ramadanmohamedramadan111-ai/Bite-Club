import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Bike, Clock, CreditCard, Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type Restaurant = {
  logo: string;
  name: string;
  rating: number;
  reviewsCount: number;
  isFavorite: boolean;
  categories: string[];
  delivery: boolean;
  pickup: boolean;
  creditCard: boolean;
  isAvailable: boolean;
  minDeliveryTime: number;
  maxDeliveryTime: number;
  minDeliveryPrice: number;
  maxDeliveryPrice: number;
};

type Props = {
  restaurant: Restaurant;
};

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <Card
      className={`overflow-hidden transition`}>
      <div className="relative">
        <Link href={`/restaurants/${restaurant.id}`}>
        <Image
          src={restaurant.logo}
          alt={restaurant.name}
          width={400}
          height={240}
          className="h-48 w-full object-cover"
        />
        </Link>

        {!restaurant.isAvailable && (
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
              restaurant.isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{restaurant.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({restaurant.reviewsCount} reviews)
          </span>
        </div>

        {restaurant.delivery && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {restaurant.minDeliveryTime === restaurant.maxDeliveryTime
                ? `${restaurant.minDeliveryTime} min`
                : `${restaurant.minDeliveryTime}-${restaurant.maxDeliveryTime} min`}
            </span>
            <span>
              {restaurant.minDeliveryPrice === restaurant.maxDeliveryPrice
                ? `${restaurant.minDeliveryPrice.toFixed(0)} delivery`
                : `${restaurant.minDeliveryPrice.toFixed(
                    0,
                  )}-${restaurant.maxDeliveryPrice.toFixed(0)} EGP. delivery`}
            </span>
          </div>
        )}

        <div className="flex gap-3">
          {restaurant.delivery && (
            <Bike className="h-5 w-5 text-muted-foreground" />
          )}
          {restaurant.pickup && (
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          )}
          {restaurant.creditCard && (
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-muted px-2 py-1 text-xs">
              {category}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
