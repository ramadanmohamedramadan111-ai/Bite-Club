'use client';

import { useState } from 'react';
import { MapPin, Pencil } from 'lucide-react';
import { GoogleMap } from '@/components/location/map';
import { LocationDialog } from '@/components/location/location-dialog';
import type { SavedLocation } from '@/components/location/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  location: SavedLocation | null;
  onLocationChange: (location: SavedLocation | null) => void;
};

export default function CheckoutDeliveryAddress({
  location,
  onLocationChange,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Delivery Address</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setDialogOpen(true)}>
            <Pencil className="size-4" />
            {location ? 'Change' : 'Select address'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {location ? (
            <>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{location.area}</p>
                  <p className="text-muted-foreground">{location.address}</p>
                </div>
              </div>
              <div className="pointer-events-none h-56 overflow-hidden rounded-xl border">
                <GoogleMap
                  value={{ lat: location.lat, lng: location.lng }}
                  onChange={() => {}}
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
              <MapPin className="mb-2 size-8 text-muted-foreground" />
              <p className="font-medium">No delivery address selected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose an address on the map to continue with delivery.
              </p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => setDialogOpen(true)}>
                Select address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        value={location}
        onLocationSelected={onLocationChange}
      />
    </>
  );
}
