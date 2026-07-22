'use client';

import { useState } from 'react';
import { ExternalLink, Users } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/lib/const-data';
import type { RestaurantType } from '@/types/restaurant/restaurant';
import { Button } from '../ui/button';
import CreateGroupOrderDialog from '../groups/CreateGroupOrderDialog';

type Props = {
  restaurant: RestaurantType;
};

export default function RestaurantGroupOrderActions({ restaurant }: Props) {
  const cart = useCartStore((state) => state.cart);
  const [dialogOpen, setDialogOpen] = useState(false);

  const restaurantId = String(restaurant.id);
  const hasActiveGroupOrderForRestaurant =
    cart?.type === 'group' && cart.restaurantId === restaurantId;

  if (hasActiveGroupOrderForRestaurant) {
    const sessionId = cart.groupSession.id;

    return (
      <Button asChild variant="outline" className="gap-2">
        <Link href={`/group-order/${sessionId}`}>
          <ExternalLink className="size-4" />
          View group order
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        className="gap-2"
        onClick={() => setDialogOpen(true)}>
        <Users className="size-4" />
        Create group order
      </Button>

      <CreateGroupOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        restaurant={restaurant}
      />
    </>
  );
}

