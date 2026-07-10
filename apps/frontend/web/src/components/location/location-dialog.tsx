'use client';

import { useEffect, useState } from 'react';
import { getCurrentPosition } from './utils-client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { reverseGeocode } from './geocoder';
import type { LatLng, SavedLocation } from './types';
import { deleteCookie, setCookie } from 'cookies-next/client';
import { GoogleMap } from './map';

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  value: SavedLocation | null;
  onLocationSelected(location: SavedLocation): void;
}

export function LocationDialog({
  open,
  onOpenChange,
  value,
  onLocationSelected,
}: Props) {
  const [location, setLocation] = useState<LatLng | null>(
    value
      ? {
          lat: value.lat,
          lng: value.lng,
        }
      : null,
  );

  const [area, setArea] = useState(value?.area ?? '');
  const [address, setAddress] = useState(value?.address ?? '');
  const [loading, setLoading] = useState(false);
  const DEFAULT_LOCATION = {
    lat: 30.0444,
    lng: 31.2357,
  };
  useEffect(() => {
    if (!open) return;

    async function initializeLocation() {
      if (value) {
        setLocation({
          lat: value.lat,
          lng: value.lng,
        });

        setArea(value.area);
        setAddress(value.address);

        return;
      }

      try {
        const current = await getCurrentPosition();

        console.log('GPS SUCCESS:', current);

        setLocation(current);

        const result = await reverseGeocode(current.lat, current.lng);

        setArea(result.area);
        setAddress(result.address);
      } catch {
        const result = await reverseGeocode(
          DEFAULT_LOCATION.lat,
          DEFAULT_LOCATION.lng,
        );

        setLocation(DEFAULT_LOCATION);
        setArea(result.area);
        setAddress(result.address);
      }
    }

    initializeLocation();
  }, [open, value]);
  async function handleLocationChange(location: LatLng) {
    setLocation(location);
    setLoading(true);

    try {
      const result = await reverseGeocode(location.lat, location.lng);

      setArea(result.area);
      setAddress(result.address);
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!location) return;

    const saved: SavedLocation = {
      ...location,
      area,
      address,
    };

    // localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(saved));
    setCookie('area', area, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setCookie('address', address, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    setCookie('lat', location.lat, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setCookie('lng', location.lng, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    onLocationSelected(saved);
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  function handleReset() {
    setLocation(null);
    setArea('');
    setAddress('');
    onLocationSelected(null);
    onOpenChange(false);
    deleteCookie('area', { path: '/' });
    deleteCookie('address', { path: '/' });
    deleteCookie('lat', { path: '/' });
    deleteCookie('lng', { path: '/' });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select your location</DialogTitle>
        </DialogHeader>

        <div className="h-[500px] overflow-hidden rounded-lg border">
          <GoogleMap value={location} onChange={handleLocationChange} />
        </div>

        <div className="min-h-12 space-y-1">
          {loading ? (
            <p className="text-sm text-muted-foreground">Finding address...</p>
          ) : location ? (
            <>
              <p className="font-medium">{area}</p>
              <p className="text-sm text-muted-foreground">{address}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click anywhere on the map to choose a location.
            </p>
          )}
        </div>

        <DialogFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={!location}>
                Reset location
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to reset your location?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  This will remove your saved location. You will need to select
                  a location again before placing an order.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={handleReset}>
                  Reset location
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!location || loading}
            onClick={handleConfirm}>
            Confirm location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

