import Image from 'next/image';
import {
  Bike,
  Clock,
  CreditCard,
  Heart,
  MapPin,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react';
import type { RestaurantDetail } from '@/types/restaurant/restaurant';
import { Button } from '../ui/button';

type Props = {
  restaurant: RestaurantDetail;
};

function formatDeliveryTime(min: number, max: number) {
  return min === max ? `${min} min` : `${min}-${max} min`;
}

function formatDeliveryPrice(min: number, max: number) {
  return min === max
    ? `${min.toFixed(0)} EGP`
    : `${min.toFixed(0)}-${max.toFixed(0)} EGP`;
}

export default function RestaurantDetailHeader({ restaurant }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="relative h-48 w-full sm:h-56">
        <Image
          src={restaurant.coverImage}
          alt={`${restaurant.name} cover`}
          fill
          className="object-cover"
          priority
        />
        {!restaurant.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-background px-4 py-2 text-sm font-medium">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="relative px-4 pb-5 pt-14 sm:px-6">
        <div className="absolute -top-10 left-4 size-20 overflow-hidden rounded-xl border-4 border-card bg-card shadow-sm sm:left-6 sm:size-24">
          <Image
            src={restaurant.logo}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex items-start justify-between gap-4 mt-4">
          <div className="min-w-0 space-y-2">
            <div className="flex gap-2 items-center">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <Heart
                className={`size-6 shrink-0 ${
                  restaurant.isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">
                  {restaurant.rating}
                </span>
                ({restaurant.reviewsCount} reviews)
              </span>

              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                {restaurant.location.address}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {restaurant.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs">
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Button type="button" className="gap-2">
              <Users className="size-4" />
              Create group order
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {restaurant.delivery && (
            <span className="inline-flex items-center gap-1.5">
              <Bike className="size-4" />
              Delivery
            </span>
          )}
          {restaurant.pickup && (
            <span className="inline-flex items-center gap-1.5">
              <ShoppingBag className="size-4" />
              Pickup
            </span>
          )}
          {restaurant.creditCard && (
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="size-4" />
              Credit Card
            </span>
          )}
          {restaurant.delivery && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatDeliveryTime(
                restaurant.minDeliveryTime,
                restaurant.maxDeliveryTime,
              )}
            </span>
          )}
          {restaurant.delivery && (
            <span>
              {formatDeliveryPrice(
                restaurant.minDeliveryPrice,
                restaurant.maxDeliveryPrice,
              )}{' '}
              delivery
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {restaurant.minimumOrder && (
            <span className="inline-flex items-center gap-1.5">
              Minimum Order: {restaurant.minimumOrder.toFixed(0)} EGP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

