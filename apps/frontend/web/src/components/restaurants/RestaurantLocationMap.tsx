'use client';

import Map, { Marker } from 'react-map-gl/maplibre';

type Props = {
  lat: number;
  lng: number;
};

export default function RestaurantLocationMap({ lat, lng }: Props) {
  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border">
      <Map
        initialViewState={{
          latitude: lat,
          longitude: lng,
          zoom: 15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}>
        <Marker latitude={lat} longitude={lng} />
      </Map>
    </div>
  );
}

