'use client';

import { useEffect, useRef } from 'react';
import Map, { Marker, MapMouseEvent, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';

import type { LatLng } from './types';

interface MapProps {
  value: LatLng | null;
  onChange(location: LatLng): void;
}

const DEFAULT_CENTER = {
  latitude: 30.0444,
  longitude: 31.2357,
};

let rtlLoaded = false;

export function GoogleMap({ value, onChange }: MapProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (rtlLoaded) return;

    maplibregl.setRTLTextPlugin(
      'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
      true,
    );

    rtlLoaded = true;
  }, []);

  useEffect(() => {
    if (!value || !mapRef.current) return;

    mapRef.current.flyTo({
      center: {
        lat: value.lat,
        lon: value.lng,
      },
      zoom: 15,
      duration: 1000,
    });
  }, [value]);

  function handleClick(event: MapMouseEvent) {
    onChange({
      lat: event.lngLat.lat,
      lng: event.lngLat.lng,
    });
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude: value?.lat ?? DEFAULT_CENTER.latitude,
        longitude: value?.lng ?? DEFAULT_CENTER.longitude,
        zoom: 13,
      }}
      style={{
        width: '100%',
        height: '100%',
      }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      onClick={handleClick}
      attributionControl={false}>
      {value && <Marker latitude={value.lat} longitude={value.lng} />}
    </Map>
  );
}

