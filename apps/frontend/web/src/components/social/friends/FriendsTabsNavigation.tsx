'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FriendsTabType } from '@/types/social/friends';
import React from 'react';

export default function FriendsTabsNavigation({
  tab,
}: {
  tab: FriendsTabType;
}) {
  return (
    <Tabs defaultValue="friends" value={tab}>
      <TabsList>
        <TabsTrigger value="friends">Friends</TabsTrigger>
        <TabsTrigger value="received">Received Requests</TabsTrigger>
        <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="blocked">Blocked</TabsTrigger>
        <TabsTrigger value="discover">Discover Users</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

