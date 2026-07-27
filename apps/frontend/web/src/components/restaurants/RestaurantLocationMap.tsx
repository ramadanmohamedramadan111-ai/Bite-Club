'use client';

import { useCallback, useEffect, useRef } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { useLocale } from 'next-intl';

type Props = {
  lat: number;
  lng: number;
};

let rtlLoaded = false;

export default function RestaurantLocationMap({ lat, lng }: Props) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (rtlLoaded) return;

    maplibregl.setRTLTextPlugin(
      'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
      true,
    );

    rtlLoaded = true;
  }, []);

  const handleLoad = useCallback(() => {
    if (!isArabic) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const layers = map.getStyle().layers;
    if (!layers) return;

    layers.forEach((layer) => {
      if (
        layer.type === 'symbol' &&
        layer.layout &&
        'text-field' in layer.layout
      ) {
        map.setLayoutProperty(
          layer.id,
          'text-field',
          [
            'coalesce',
            ['get', 'name:ar'],
            ['get', 'name:latin'],
            ['get', 'name'],
          ],
        );
      }
    });
  }, [isArabic]);

  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: lat,
          longitude: lng,
          zoom: 15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
        onLoad={handleLoad}>
        <Marker latitude={lat} longitude={lng} />
      </Map>
    </div>
  );
}
