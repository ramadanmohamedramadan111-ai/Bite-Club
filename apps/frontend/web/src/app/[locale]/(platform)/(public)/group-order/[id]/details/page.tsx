import type { Metadata } from 'next';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api';
import { GroupOrderCartSession } from '@/types/group-order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ShieldAlert } from 'lucide-react';
import GroupOrderDetailClient from '@/components/groups/GroupOrderDetailClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  let sessionCart: GroupOrderCartSession;
  try {
    const response = await serverFetch<ApiResponse<GroupOrderCartSession>>(
      `/user/group-orders/${id}/detail`,
      'GET',
      {
        next: {
          tags: [`group-order-session-${id}`],
        },
      }
    );
    sessionCart = response.data;
  } catch (error: any) {
    console.error('Failed to load group order detail:', error);
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md text-center border-destructive/20 shadow-lg rounded-2xl">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <p className="text-sm text-muted-foreground">
              You must be a member of the group to view this group order's details, or the session does not exist.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full h-11 rounded-xl font-bold cursor-pointer">
                <Link href="/login">Login to Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <GroupOrderDetailClient sessionCart={sessionCart} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await serverFetch<ApiResponse<GroupOrderCartSession>>(`/user/group-orders/${id}/detail`);
    const cart = res?.data;
    if (cart) {
      return {
        title: `Group Order Details - ${cart.restaurant.name} | Bite Club`,
        description: `Details for group order at ${cart.restaurant.name}. Status: ${cart.status}`,
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: "Group Order Details | Bite Club",
  };
}
