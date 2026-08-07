import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Users, Crown } from 'lucide-react';
import { ApiResponse } from '@/types/api';
import { GroupTypeSimplified } from '@/types/groups';
import { serverFetch } from '@/utils/server-fetch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import JoinGroup from '@/components/groups/JoinGroup';
import { getMediaUrl } from '@/lib/utils';

type PageProps = {
  params: Promise<{ locale: string; token: string }>;
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
    <div className="relative flex py-12 items-center justify-center overflow-hidden">
      {/* Ambient gradient backgrounds for premium feel */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.06),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(234,88,12,0.04),transparent_40%)]" />

      <Card className="w-full max-w-md overflow-hidden border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-primary/5 hover:border-border/60">
        <div className="h-2 bg-gradient-to-r from-primary to-orange-500" />

        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-5 text-center">
            {/* Glowing Avatar Wrapper */}
            <div className="relative mx-auto w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary to-orange-500 shadow-md">
              <Avatar className="w-full h-full border border-background shadow-inner">
                <AvatarImage
                  src={getMediaUrl(group.image_url)}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-extrabold bg-gradient-to-br from-muted/80 to-muted text-primary">
                  {group.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                {t('invitedToJoin')}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {group.name}
              </h1>

              {group.description && (
                <div className="relative rounded-xl border border-border/30 bg-muted/20 px-4 py-3.5">
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    "{group.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats display */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/30 bg-muted/25 p-4">
            <div className="flex flex-col items-center justify-center text-center p-2 border-r border-border/20">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/5 text-primary mb-2">
                <Users className="size-4.5" />
              </div>
              <p className="text-2xl font-black text-foreground tabular-nums">
                {group.members_count}
              </p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                {t('members')}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-2">
              <div className="flex items-center justify-center size-8 rounded-full bg-orange-500/5 text-orange-600 mb-2">
                <Crown className="size-4.5" />
              </div>
              <p className="text-sm font-bold text-foreground truncate max-w-[130px] leading-tight">
                {group.owner.full_name}
              </p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                {t('owner')}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <JoinGroup token={token} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  try {
    const res = await serverFetch<ApiResponse<GroupTypeSimplified>>(
      `/groups/invite/${token}`,
    );
    const group = res?.data;
    if (group) {
      return {
        title: t('groupInvite.title', { group: group.name }),
        description: t('groupInvite.description', { description: group.description || t('groupInvite.fallbackTitle') }),
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: t('groupInvite.fallbackTitle'),
  };
}

