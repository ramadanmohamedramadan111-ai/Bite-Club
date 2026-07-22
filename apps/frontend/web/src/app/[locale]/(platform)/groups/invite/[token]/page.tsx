import { getTranslations } from 'next-intl/server';
import { ApiResponse } from '@/types/api/api-response';
import { GroupTypeSimplified } from '@/types/groups/groups';
import { serverFetch } from '@/utils/server-fetch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import JoinGroup from '@/components/groups/JoinGroup';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  const t = await getTranslations('groups');

  const { data: group } = await serverFetch<ApiResponse<GroupTypeSimplified>>(
    `/groups/invite/${token}`,
    'GET',
    {
      next: {
        tags: ['groups-invite', `groups-invite-${token}`],
      },
    },
  );

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-lg overflow-hidden">
        <CardHeader className="space-y-5 pb-4 text-center">
          <Avatar className="mx-auto size-24 border shadow-sm">
            <AvatarImage src={group.image_url ?? undefined} />
            <AvatarFallback className="text-3xl font-semibold">
              {group.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('invitedToJoin')}
            </p>

            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>

            {group.description && (
              <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 divide-x rounded-lg border bg-muted/30">
            <div className="p-5 text-center">
              <p className="text-3xl font-bold">{group.members_count}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('members')}</p>
            </div>

            <div className="p-5 text-center flex items-center flex-col justify-center">
              <p className="mb-1 text-sm text-muted-foreground">{t('owner')}</p>
              <p className="truncate font-semibold">{group.owner.full_name}</p>
            </div>
          </div>

          <JoinGroup token={token} />
        </CardContent>
      </Card>
    </div>
  );
}

