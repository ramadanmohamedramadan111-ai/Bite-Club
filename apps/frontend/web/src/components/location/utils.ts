import { cookies } from 'next/headers';
import type { SavedLocation } from '@/components/location/types';

export async function getSavedLocation(): Promise<SavedLocation | null> {
  const cookieStore = await cookies();

  const lat = Number(cookieStore.get('lat')?.value);
  const lng = Number(cookieStore.get('lng')?.value);

  const area = cookieStore.get('area')?.value;
  const address = cookieStore.get('address')?.value;

  if (!area || !address || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    lat,
    lng,
    area,
    address,
  };
}

