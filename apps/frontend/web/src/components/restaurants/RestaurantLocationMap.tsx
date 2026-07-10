'use client';

import Map, { Marker } from 'react-map-gl/maplibre';
import type { RestaurantLocation } from '@/types/restaurant/restaurant';

type Props = {
  location: RestaurantLocation;
};

export default function RestaurantLocationMap({ location }: Props) {
  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border">
      <Map
        initialViewState={{
          latitude: location.latitude,
          longitude: location.longitude,
          zoom: 15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}>
        <Marker latitude={location.latitude} longitude={location.longitude} />
      </Map>
    </div>
  );
}
