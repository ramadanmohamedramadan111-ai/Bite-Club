import type { Metadata } from 'next';
import CartPageView from '@/components/cart/CartPageView';

export default function CartPage() {
  return <CartPageView />;
}


export const metadata: Metadata = {
  title: "My Cart | Bite Club",
  description: "Review items in your individual shopping cart before checking out.",
};
