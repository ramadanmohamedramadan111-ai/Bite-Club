'use client';

import { useState } from 'react';
import Selectors from './Selectors';
import { Link } from '@/i18n/navigation';
import { BellIcon } from 'lucide-react';
import CartButton from '../cart/CartButton';

export default function FullSelectors() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-3">
        <Link href="/notifications" className="flex items-center">
          <BellIcon className="size-5" />
        </Link>
        <CartButton />
      </div>
      <Selectors />
    </div>
  );
}
