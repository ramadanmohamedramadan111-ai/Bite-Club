'use client';

import { useGroupOrderSessionsStore } from '@/stores/group-order-sessions';
import type { GroupOrderSession } from '@/types/group-order/group-order';
import { useEffect } from 'react';

type Props = {
  sessions: GroupOrderSession[];
};

export default function GroupOrderSessionsInitializer({ sessions }: Props) {
  const setSessions = useGroupOrderSessionsStore((s) => s.setSessions);

  useEffect(() => {
    setSessions(sessions);
  }, [sessions, setSessions]);

  return null;
}
