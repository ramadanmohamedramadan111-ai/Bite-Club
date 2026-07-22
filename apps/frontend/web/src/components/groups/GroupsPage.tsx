'use client';

import { useGroupsStore } from '@/lib/const-data';

import ActiveSessionsSection from './ActiveSessionsSection';
import CreateGroupDialog from './CreateGroupDialog';
import GroupCard from './GroupCard';
import GroupsHeader from './GroupsHeader';

export default function GroupsPage() {
  const groups = useGroupsStore((state) => state.groups);

  return <div></div>;
}

