import { getSavedLocation } from '@/components/location/utils';
import CheckoutView from '@/components/checkout/CheckoutView';

export default async function CheckoutPage() {
  const initialLocation = await getSavedLocation();

  return <CheckoutView initialLocation={initialLocation} />;
}
