'use client';

export async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);

  if (!response.ok) {
    throw new Error('No address found');
  }

  const data = await response.json();

  const area =
    data.address?.suburb ||
    data.address?.neighbourhood ||
    data.address?.city_district ||
    data.address?.city ||
    data.address?.county ||
    data.display_name;

  return {
    area,
    address: data.display_name,
  };
}
