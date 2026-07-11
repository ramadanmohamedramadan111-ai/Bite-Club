'use client';

import Map, { Marker } from 'react-map-gl/maplibre';
import type { OrderLocation } from '@/types/orders/order';

type Props = {
  location: OrderLocation;
};

export default function OrderLocationMap({ location }: Props) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border">
      <Map
        initialViewState={{
          latitude: location.latitude,
          longitude: location.longitude,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
      >
        <Marker latitude={location.latitude} longitude={location.longitude} />
      </Map>
    </div>
  );
}
