'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Users } from 'lucide-react';

import GroupCartActionButton from '@/components/cart/GroupCartActionButton';
import GroupCartItemsList from '@/components/cart/GroupCartItemsList';
import GroupCartTotals from '@/components/cart/GroupCartTotals';
import GroupOrderMenuItems from '@/components/groups/GroupOrderMenuItems';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupOrderCartSession } from '@/types/group-order/group-order';
import type { MenuItems } from '@/types/restaurant/restaurant';

type Props = {
  sessionId: string;
  sessionCart: GroupOrderCartSession;
  sessionMenu: MenuItems[];
  currentUserId: number | null;
};

export default function GroupOrderPageView({
  sessionId,
  sessionCart,
  sessionMenu,
  currentUserId,
}: Props) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const restaurant = sessionCart.restaurant;
  const membersSummary = sessionCart.members_summary;
  const totalItems = membersSummary.reduce(
    (sum, m) => sum + m.items.length,
    0,
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-8">
      <div className="flex items-start gap-4">
        {restaurant.image_url && (
          <div className="relative size-16 overflow-hidden rounded-xl">
            <Image
              src={restaurant.image_url}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{t('groupOrder')}</h1>
          <p className="mt-1 text-muted-foreground">{restaurant.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Users className="size-3.5" />
              {t('host')}: {sessionCart.host.name}
            </span>
          </div>
        </div>
      </div>

      {membersSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('members')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {membersSummary.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs">
                    {member.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {member.user.name}
                  {currentUserId !== null && member.user.id === currentUserId && (
                    <span className="ms-1 text-xs text-muted-foreground">
                      {tc('you')}
                    </span>
                  )}
                  {member.user.id === sessionCart.host.id && (
                    <span className="ms-1 text-xs text-muted-foreground">
                      {t('host')}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <GroupOrderMenuItems
            sessionId={Number(sessionId)}
            menuGroups={sessionMenu}
          />
        </div>

        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle className="text-base">{t('groupCart')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {totalItems === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('noItemsYet')}
              </p>
            ) : (
              <GroupCartItemsList
                membersSummary={membersSummary}
                sessionId={Number(sessionId)}
              />
            )}

            <GroupCartTotals
              membersSummary={membersSummary}
              totalAmount={sessionCart.total_amount}
            />

            <GroupCartActionButton sessionId={Number(sessionId)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
