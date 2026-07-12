'use client';

import Selectors from './Selectors';
import CartButton from '../cart/CartButton';
import NotificationPopover from './NotificationPopover';

export default function FullSelectors() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-3">
        <NotificationPopover />
        <CartButton />
      </div>
      <Selectors />
    </div>
  );
}
