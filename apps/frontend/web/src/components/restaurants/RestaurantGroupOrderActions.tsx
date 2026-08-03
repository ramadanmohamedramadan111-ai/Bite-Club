'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Users } from 'lucide-react';

import type { RestaurantType } from '@/types/restaurant';
import { Button } from '../ui/button';
import CreateGroupOrderDialog from '../groups/CreateGroupOrderDialog';

import { useAuthStore } from '@/stores/auth';

type Props = {
  restaurant: RestaurantType;
};

export default function RestaurantGroupOrderActions({ restaurant }: Props) {
  const t = useTranslations('restaurants');
  const [dialogOpen, setDialogOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        type="button"
        className="gap-2"
        disabled={!restaurant.is_open_now}
        onClick={() => setDialogOpen(true)}>
        <Users className="size-4" />
        {t('createGroupOrder')}
      </Button>

      <CreateGroupOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        restaurant={restaurant}
      />
    </>
  );
}

