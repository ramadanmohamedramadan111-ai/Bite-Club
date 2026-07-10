import React from 'react';
import { Settings2 } from 'lucide-react';

import { LocationButton } from '@/components/location/location-button';
import FullSelectors from '@/components/navbar/FullSelectors';
import SearchForm from '@/components/navbar/SearchForm';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getSavedLocation } from '@/utils/map';
import LocationButtonServer from '@/components/location/location-button-server';
import CartDrawerHost from '@/components/cart/CartDrawerHost';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/95 backdrop-blur px-4">
          {' '}
          <SidebarTrigger className="-ml-1" />
          <div className="ml-2 flex min-w-0 flex-1 items-center gap-2">
            <div className="">
              <LocationButtonServer />
            </div>

            <div className="min-w-0 flex-1">
              <SearchForm />
            </div>
          </div>
          {/* Desktop */}
          <div className="ml-4 hidden shrink-0 md:block">
            <FullSelectors />
          </div>
          {/* Mobile */}
          <div className="ml-2 md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-40 h-16 items-center justify-center p-2">
                <FullSelectors />
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="min-h-[200vh] p-4">{children}</main>
      </SidebarInset>
      <CartDrawerHost />
    </SidebarProvider>
  );
}

