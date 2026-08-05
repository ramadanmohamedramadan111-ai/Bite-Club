'use client';

import { useTranslations } from 'next-intl';
import { Clock, Users, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
import type { GroupOrderHistory } from '@/types/group-order';
import { getMediaUrl } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Link } from '@/i18n/navigation';

type Props = {
  order: GroupOrderHistory;
};

export default function GroupOrderHistoryCard({ order }: Props) {
  const t = useTranslations('orderStatus');
  const tc = useTranslations('common');

  const isCompleted = order.status === 'completed';

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-border/40 hover:shadow-sm transition-shadow">
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
        <Link href={`/group-order/${order.id}/details`} className="flex flex-1 items-center gap-3 group">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={getMediaUrl(order.restaurant.image_url)} />
            <AvatarFallback className="rounded-md">
              {order.restaurant.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold leading-none group-hover:text-primary transition-colors truncate">
                {order.restaurant.name}
              </p>
              <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {tc('by')} {order.host.name}
            </p>
          </div>
        </Link>

        <Badge variant={isCompleted ? 'default' : 'destructive'} className="shrink-0">
          {isCompleted ? t('completed') : t('cancelled')}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <Separator className="bg-border/30" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(order.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {order.members_summary.length}{' '}
              {order.members_summary.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline cursor-pointer focus:outline-none"
          >
            <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        </div>

        {/* Collapsable Members details */}
        {isExpanded && (
          <div className="space-y-2.5 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
            {order.members_summary.map((member) => (
              <div key={member.user.id} className="rounded-lg bg-muted/40 p-3 border border-border/10">
                <div className="flex items-center justify-between font-semibold text-sm mb-2.5 pb-2 border-b border-border/20">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 rounded-full border border-border/10">
                      <AvatarImage
                        src={getMediaUrl(member.user.profile_image)}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[10px]">
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-left flex items-center gap-1">
                      {member.user.name}
                      {member.user.is_guest && (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[8px] font-bold text-accent-foreground uppercase tracking-wider">
                          Guest
                        </span>
                      )}
                    </span>
                  </div>
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'EGP',
                    }).format(member.user_total)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {member.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground text-xs shrink-0">
                          {item.quantity}x
                        </span>
                        {item.item && (
                          <>
                            <Avatar className="size-6 rounded-md border border-border/10">
                              <AvatarImage
                                  src={getMediaUrl(item.item.image_url)}
                                  className="object-cover"
                                />
                                <AvatarFallback className="rounded-md text-[10px]">
                                  {item.item.title.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">{item.item.title}</span>
                            </>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs shrink-0">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'EGP',
                          }).format(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        <div className="flex items-center justify-between pt-2 border-t border-border/10">
          <p className="text-sm font-semibold text-muted-foreground">Total Amount</p>
          <p className="font-bold text-base text-foreground">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'EGP',
            }).format(order.total_amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
