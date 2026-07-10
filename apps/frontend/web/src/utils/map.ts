import type { SavedLocation } from '@/components/location/types';
import { getCookie } from 'cookies-next/client';

export function getSavedLocation(): SavedLocation | null {
  const lat = Number(getCookie('lat'));
  const lng = Number(getCookie('lng'));

  const area = getCookie('area');
  const address = getCookie('address');

  if (!area || !address || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    lat,
    lng,
    area: String(area),
    address: String(address),
  };
}

