import { mockGroupSession, mockGroupRestaurant, mockGroupMenuItems, mockGroupCart } from '@/lib/const-data';
import GroupOrderPageView from '@/components/groups/GroupOrderPageView';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <GroupOrderPageView
      sessionId={id}
      mock={{
        session: mockGroupSession,
        restaurant: mockGroupRestaurant,
        menuItems: mockGroupMenuItems,
        cart: mockGroupCart,
      }}
    />
  );
}
