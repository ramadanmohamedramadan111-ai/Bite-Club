'use client';

import Selectors from './Selectors';
import CartButton from '../cart/CartButton';
import NotificationPopover from './NotificationPopover';
import GroupOrderSessionsButton from './GroupOrderSessionsButton';
import { useAuthStore } from '@/stores/auth';

export default function FullSelectors() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex items-center justify-center gap-2">
      {isAuthenticated && (
        <div className="flex items-center justify-center gap-3">
          <NotificationPopover />
          <GroupOrderSessionsButton />
        </div>
      )}
      {isAuthenticated && <CartButton />}
      <Selectors />
    </div>
  );
}

