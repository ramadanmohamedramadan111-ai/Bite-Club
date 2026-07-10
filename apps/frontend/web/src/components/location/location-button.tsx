'use client';

import { useEffect, useState } from 'react';
import { MapPinIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { LocationDialog } from './location-dialog';
import type { SavedLocation } from './types';
import { getCookie } from 'cookies-next/client';
import { getSavedLocation } from '@/utils/map';

export function LocationButton({
  initialLocation,
}: {
  initialLocation: SavedLocation | null;
}) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<SavedLocation | null>(
    initialLocation,
  );

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="min-w-0 gap-2 px-2 sm:px-3">
        <MapPinIcon className="size-4 shrink-0" />

        <span className="hidden sm:block truncate max-w-[120px] md:max-w-[180px] lg:max-w-[240px]">
          {location?.area ?? 'Choose a location'}
        </span>
      </Button>

      <LocationDialog
        open={open}
        onOpenChange={setOpen}
        value={location}
        onLocationSelected={setLocation}
      />
    </>
  );
}

