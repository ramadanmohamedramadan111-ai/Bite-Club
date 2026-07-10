import React, { Suspense } from 'react';
import { getSavedLocation } from './utils';
import { LocationButton } from './location-button';

export default async function LocationButtonServer() {
  const location = await getSavedLocation();

  return (
    <Suspense fallback={<LocationButtonSkeleton />}>
      <LocationButton initialLocation={location} />
    </Suspense>
  );
}

function LocationButtonSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3">
      <div className="size-4 rounded-full bg-muted" />
      <div className="hidden sm:block h-4 w-24 rounded bg-muted" />
    </div>
  );
}

