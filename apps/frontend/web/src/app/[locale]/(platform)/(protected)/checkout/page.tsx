import type { Metadata } from 'next';
import { getSavedLocation } from '@/components/location/utils';
import CheckoutView from '@/components/checkout/CheckoutView';

export default async function CheckoutPage() {
  const initialLocation = await getSavedLocation();

  return <CheckoutView initialLocation={initialLocation} />;
}


export const metadata: Metadata = {
  title: "Checkout | Bite Club",
  description: "Complete your individual or group order checkout on Bite Club safely and securely.",
};
