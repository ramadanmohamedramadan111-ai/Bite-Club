'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';

type Props = {
  lat: number;
  lng: number;
};

let rtlLoaded = false;

export default function RestaurantLocationMap({ lat, lng }: Props) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const mapRef = useRef<MapRef>(null);
  const t = useTranslations('restaurants');
  const [renderFailed, setRenderFailed] = useState(() => {
    if (typeof document === 'undefined') return false;

    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        canvas.getContext('webgl2') || canvas.getContext('webgl')
      );
      return !supported;
    } catch {
      return true;
    }
  });

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

  const handleError = useCallback(() => {
    setRenderFailed(true);
  }, []);

  if (renderFailed) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center gap-2 rounded-xl border bg-muted/40 p-6 text-center">
        <MapPin className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {t('mapUnavailable')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('mapUnavailableDesc', { lat, lng })}
        </p>
      </div>
    );
  }

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
        mapLib={maplibregl}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
        onError={handleError}
        onLoad={handleLoad}>
        <Marker latitude={lat} longitude={lng} />
      </Map>
    </div>
  );
}
