'use client';

import { useEffect, useRef, useState } from 'react';
import { getCurrentPosition } from './utils-client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

import { useTranslations } from 'next-intl';
import { reverseGeocode, searchGeocode } from './geocoder';
import type { GeocodeResult } from './geocoder';
import type { LatLng, SavedLocation } from './types';
import { deleteCookie, setCookie } from 'cookies-next/client';
import { GoogleMap } from './map';
import { Search, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  value: SavedLocation | null;
  onLocationSelected(location: SavedLocation | null): void;
}

export function LocationDialog({
  open,
  onOpenChange,
  value,
  onLocationSelected,
}: Props) {
  const t = useTranslations('location');
  const tc = useTranslations('common');
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
    }
  }, [open]);

  function handleSearchInput(query: string) {
    setSearchQuery(query);
    setShowResults(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchGeocode(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function handleSelectResult(result: GeocodeResult) {
    const newLocation = { lat: result.lat, lng: result.lng };
    setLocation(newLocation);
    setArea(result.address.split(',')[0] || result.address);
    setAddress(result.address);
    setSearchQuery(result.address.split(',')[0] || result.address);
    setShowResults(false);
  }

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('selectLocation')}</DialogTitle>
        </DialogHeader>

        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="pl-9"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-lg">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-3 py-2 text-left text-sm transition hover:bg-muted first:rounded-t-lg last:rounded-b-lg">
                  <p className="font-medium">{result.address.split(',')[0]}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {result.address}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-[300px] sm:h-[450px] overflow-hidden rounded-lg border">
          <GoogleMap value={location} onChange={handleLocationChange} />
        </div>

        <div className="min-h-12 space-y-1">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('findingAddress')}</p>
          ) : location ? (
            <>
              <p className="font-medium">{area}</p>
              <p className="text-sm text-muted-foreground">{address}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('clickMapInstruction')}
            </p>
          )}
        </div>

        <DialogFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={!location}>
                {t('resetLocation')}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('confirmResetTitle')}
                </AlertDialogTitle>

                <AlertDialogDescription>
                  {t('confirmResetDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>

                <AlertDialogAction onClick={handleReset}>
                  {t('resetLocation')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="button" variant="outline" onClick={handleCancel}>
            {tc('cancel')}
          </Button>

          <Button
            type="button"
            disabled={!location || loading}
            onClick={handleConfirm}>
            {t('confirmLocation')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
