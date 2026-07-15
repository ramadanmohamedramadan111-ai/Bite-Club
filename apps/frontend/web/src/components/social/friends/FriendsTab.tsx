import { ApiResponse } from '@/types/api/api-response';
import { FriendResponseType } from '@/types/social/friends';
import { buildQueryString } from '@/utils/api-helpers';
import { serverFetch } from '@/utils/server-fetch';
import React from 'react';

export default async function FriendsTab({ search }: { search: string }) {
  const query = buildQueryString({ search });

  const users = await serverFetch<ApiResponse<{ items: FriendResponseType[] }>>(
    `/friends${query}`,
  );

  // if (!users.length) {
  //   return (
  //     <div
  //       className="
  //         py-10
  //         text-center
  //         text-muted-foreground
  //       ">
  //       No users found
  //     </div>
  //   );
  // }

  // return (
  //   <div className="space-y-3">
  //     {users.map((user) => (
  //       <UserCard key={user.id} user={user} tab={tab} />
  //     ))}
  //   </div>
  // );

  return <div>{JSON.stringify(users)}</div>;
}

