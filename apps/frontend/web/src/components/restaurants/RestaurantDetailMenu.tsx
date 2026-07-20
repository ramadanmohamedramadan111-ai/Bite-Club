import type { MenuItems, RestaurantType } from '@/types/restaurant/restaurant';
import RestaurantDetailMenuClient from './RestaurantDetailMenuClient';
import type { OrderingContext } from './MenuItemCustomizer';

type Props = {
  restaurant: RestaurantType;
  menuItems: MenuItems[];
  orderingContext?: OrderingContext;
};

export default function RestaurantDetailMenu({
  restaurant,
  menuItems,
  orderingContext = 'restaurant',
}: Props) {
  return (
    <div className="space-y-6">
      <RestaurantDetailMenuClient
        restaurant={restaurant}
        menuItems={menuItems}
        orderingContext={orderingContext}
      />
    </div>
  );
}
