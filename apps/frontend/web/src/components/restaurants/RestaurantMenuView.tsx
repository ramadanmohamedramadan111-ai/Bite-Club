import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { MenuItem as ClientMenuItem, BackendMenuItem, MenuItems as BackendMenuItems, RestaurantType } from '@/types/restaurant/restaurant';

import RestaurantMenuClientView from './RestaurantMenuClientView';
import type { OrderingContext } from './MenuItemCustomizer';

type Props = {
  restaurant: RestaurantType;
  items: any[];
  showScannedMenu?: boolean;
  orderingContext?: OrderingContext;
};

function normalizeMenuItems(
  inputItems: any[],
  restaurantId: number
): ClientMenuItem[] {
  if (!inputItems || inputItems.length === 0) return [];

  // Check if the first item has an 'items' array (meaning it is a grouped MenuItems from the backend)
  if ('items' in inputItems[0]) {
    const grouped = inputItems as BackendMenuItems[];
    const flat: ClientMenuItem[] = [];

    grouped.forEach((group) => {
      const categoryTitle = group.title;
      group.items.forEach((item) => {
        flat.push({
          id: item.id,
          name: item.title,
          description: item.description || '',
          price: Number(item.price),
          categories: [categoryTitle],
          likesCount: 0,
          preparationTime: 15,
          available: item.is_available,
          image: item.image_url || '/storage/restaurants/restaurant.jpeg',
          options: [], // Options will be customized in client dialog
          restaurantId: restaurantId,
        });
      });
    });

    return flat;
  }

  // Otherwise, it's already a flat ClientMenuItem[] (or mock data)
  return inputItems as ClientMenuItem[];
}

export default function RestaurantMenuView({
  restaurant,
  items,
  showScannedMenu = true,
  orderingContext = 'restaurant',
}: Props) {
  const normalizedItems = normalizeMenuItems(items, restaurant.id);
  const scannedMenu = (restaurant as any).scannedMenu || (restaurant as any).scanned_menu_url || null;

  return (
    <div className="space-y-6">
      {showScannedMenu && scannedMenu && (
        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <p className="font-medium">Scanned Menu</p>
              <p className="text-sm text-muted-foreground">
                Tap to view the full menu image
              </p>
            </div>
            <a
              href={scannedMenu}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Open
              <ExternalLink className="size-4" />
            </a>
          </div>
          <a
            href={scannedMenu}
            target="_blank"
            rel="noopener noreferrer"
            className="block">
            <div className="relative h-40 w-full sm:h-48">
              <Image
                src={scannedMenu}
                alt="Scanned menu"
                fill
                className="object-cover transition hover:opacity-90"
              />
            </div>
          </a>
        </div>
      )}

      <RestaurantMenuClientView
        restaurant={restaurant}
        items={normalizedItems}
        orderingContext={orderingContext}
      />
    </div>
  );
}


