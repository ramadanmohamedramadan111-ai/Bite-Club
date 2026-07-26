'use client';

import GroupOrderSessionsDrawer from './GroupOrderSessionsDrawer';
import { useGroupOrderDrawerStore } from '@/stores/group-order-drawer';

export default function GroupOrderSessionsDrawerHost() {
  const open = useGroupOrderDrawerStore((state) => state.open);
  const closeDrawer = useGroupOrderDrawerStore((state) => state.closeDrawer);

  return <GroupOrderSessionsDrawer open={open} onClose={closeDrawer} />;
}
