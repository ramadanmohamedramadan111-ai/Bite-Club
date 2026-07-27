import { getTranslations } from 'next-intl/server';
import { Clock, Users } from 'lucide-react';

import type { GroupOrderHistory } from '@/types/group-order';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

type Props = {
  order: GroupOrderHistory;
};

export default async function GroupOrderHistoryCard({ order }: Props) {
  const t = await getTranslations('orderStatus');
  const tc = await getTranslations('common');

  const isCompleted = order.status === 'completed';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage src={order.restaurant.image_url ?? undefined} />
          <AvatarFallback className="rounded-md">
            {order.restaurant.name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col">
          <p className="font-semibold leading-none">{order.restaurant.name}</p>
          <p className="text-sm text-muted-foreground">
            {tc('by')} {order.host.name}
          </p>
        </div>

        <Badge variant={isCompleted ? 'default' : 'destructive'}>
          {isCompleted ? t('completed') : t('cancelled')}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <Separator />

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

        {order.members_summary.map((member) => (
          <div key={member.user.id} className="rounded-lg bg-muted/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{member.user.name}</p>
              <p className="text-sm font-semibold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'EGP',
                }).format(member.user_total)}
              </p>
            </div>

            <div className="space-y-1">
              {member.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {item.quantity}x
                    </span>
                    <span>{item.item.title}</span>
                  </div>
                  <span className="text-muted-foreground">
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

        <div className="flex items-center justify-between pt-1">
          <p className="text-sm font-medium">Total</p>
          <p className="font-semibold">
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

