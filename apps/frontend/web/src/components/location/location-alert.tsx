'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { LocationDialog } from './location-dialog';
import type { SavedLocation } from './types';

interface Props {
  initialHasLocation: boolean;
}

export function LocationAlert({ initialHasLocation }: Props) {
  const t = useTranslations('location');
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(!initialHasLocation);
  const [location, setLocation] = useState<SavedLocation | null>(null);

  useEffect(() => {
    setVisible(!initialHasLocation);
  }, [initialHasLocation]);

  const handleLocationSelected = (selected: SavedLocation | null) => {
    setLocation(selected);
    if (selected) {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 backdrop-blur-xs transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10 shadow-xs mb-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-top-4">
        {/* Background Decorative Gradient Radial */}
        <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <MapPin className="size-5 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-base sm:text-lg">
                {t('requiredTitle') || 'Select Location'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {t('requiredMessage') || 'Select your location to discover top restaurants and food options near you.'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto gap-2 bg-amber-500 text-white hover:bg-amber-600 rounded-xl font-medium px-5 h-10 shadow-sm shrink-0 transition-all duration-200 hover:translate-y-[-1px] cursor-pointer"
          >
            <MapPin className="size-4" />
            {t('chooseLocationButton') || 'Choose Location'}
          </Button>
        </div>
      </div>

      <LocationDialog
        open={open}
        onOpenChange={setOpen}
        value={location}
        onLocationSelected={handleLocationSelected}
      />
    </>
  );
}
