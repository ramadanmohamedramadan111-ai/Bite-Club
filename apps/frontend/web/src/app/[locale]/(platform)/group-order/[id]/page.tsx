import GroupOrderPageView from '@/components/groups/GroupOrderPageView';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { getTranslations } from 'next-intl/server';
import { GroupOrderCartSession } from '@/types/group-order/group-order';
import { MenuItems } from '@/types/restaurant/restaurant';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { XCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const sessionCart = await serverFetch<ApiResponse<GroupOrderCartSession>>(
    `/user/group-orders/${id}`,
    'GET',
    {
      next: {
        tags: [`group-order-session-${id}`],
      },
    },
  );

  if (sessionCart.data.status === 'cancelled') {
    const t = await getTranslations('groups');
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">{t('groupOrderCancelled')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('groupOrderCancelledDesc', { restaurant: sessionCart.data.restaurant.name })}
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/groups">{t('backToGroups')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionMenu = await serverFetch<
    ApiResponse<PaginatedResponse<MenuItems>>
  >(`/user/restaurants/${sessionCart.data.restaurant.id}/menu`, 'GET', {
    next: {
      tags: [`group-order-session-menu-${id}`],
    },
  });

  const currentUserId = await getUserId();

  return (
    <GroupOrderPageView
      sessionId={id}
      sessionCart={sessionCart.data}
      sessionMenu={sessionMenu.data.items}
      currentUserId={currentUserId}
    />
  );
}

