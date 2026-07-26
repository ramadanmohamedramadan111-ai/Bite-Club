'use client';

import Selectors from './Selectors';
import CartButton from '../cart/CartButton';
import NotificationPopover from './NotificationPopover';
import GroupOrderSessionsButton from './GroupOrderSessionsButton';

export default function FullSelectors() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-3">
        <NotificationPopover />
        <CartButton />
        <GroupOrderSessionsButton />
      </div>
      <Selectors />
    </div>
  );
}

