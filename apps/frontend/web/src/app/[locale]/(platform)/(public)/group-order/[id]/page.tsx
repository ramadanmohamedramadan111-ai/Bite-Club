import type { Metadata } from 'next';
import GroupOrderPageView from '@/components/groups/GroupOrderPageView';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { GroupOrderCartSession } from '@/types/group-order';
import { MenuItems } from '@/types/restaurant';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
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

  if (sessionCart.data.status === 'completed') {
    const t = await getTranslations('groups');
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">
              {t('groupOrderCompleted')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('groupOrderCompletedDesc', {
                restaurant: sessionCart.data.restaurant.name,
              })}
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/groups">{t('backToGroups')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionCart.data.status === 'cancelled') {
    const t = await getTranslations('groups');
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">
              {t('groupOrderCancelled')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('groupOrderCancelledDesc', {
                restaurant: sessionCart.data.restaurant.name,
              })}
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
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || null;

  return (
    <GroupOrderPageView
      sessionId={id}
      sessionCart={sessionCart.data}
      sessionMenu={sessionMenu.data.items}
      currentUserId={currentUserId}
      token={token}
    />
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  try {
    const res = await serverFetch<ApiResponse<GroupOrderCartSession>>(`/user/group-orders/${id}`);
    const cart = res?.data;
    if (cart) {
      return {
        title: t('groupOrder.title', { restaurant: cart.restaurant.name }),
        description: t('groupOrder.description', { restaurant: cart.restaurant.name, status: cart.status }),
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: t('groupOrder.fallbackTitle'),
  };
}
