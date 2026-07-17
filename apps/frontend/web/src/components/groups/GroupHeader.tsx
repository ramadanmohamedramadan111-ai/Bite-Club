import React from 'react';
import GroupImage from './GroupImage';
import { GroupType } from '@/types/groups/groups';
import GroupHeaderActiveSession from './GroupHeaderActiveSession';

export default function GroupHeader({ group }: { group: GroupType }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <GroupImage
          src={group.image_url}
          alt={group.name}
          className="size-16 rounded-xl"
          fallbackClassName="size-16 rounded-xl"
        />
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="mt-1 text-muted-foreground">{group.description}</p>
        </div>
      </div>
      <GroupHeaderActiveSession />
    </div>
  );
}

