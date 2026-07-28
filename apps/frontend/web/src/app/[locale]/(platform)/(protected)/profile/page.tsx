import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api';
import type { UserResponse } from '@/types/user';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import { UserPostsSection } from '@/components/posts/UserPostsSection';
import ReferralLinkSection from '@/components/profile/ReferralLinkSection';
import { Card, CardContent } from '@/components/ui/card';

async function getProfile(): Promise<UserResponse | null> {
  try {
    const res = await serverFetch<ApiResponse<UserResponse>>('/user/me');
    return res.data;
  } catch {
    return null;
  }
}

export default async function MyProfilePage() {
  const t = await getTranslations('profile');
  const tc = await getTranslations('common');
  const user = await getProfile();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground font-medium">
        {tc('failedToLoad')}
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8">
      {/* Title Header with Edit Profile button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link href="/profile/edit" className="w-fit cursor-pointer shrink-0 mt-3 sm:mt-0">
          <Button variant="outline" size="icon" className="rounded-xl border-border bg-background/50 hover:bg-background hover:border-border/80 cursor-pointer shadow-xs">
            <Edit className="h-5 w-5 text-foreground" />
          </Button>
        </Link>
      </div>

      {/* User profile detail card */}
      <Card className="w-full">
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-4.5">
            <Avatar className="h-20 w-20 rounded-full border-2 border-primary/20 shadow-xs">
              <AvatarImage src={user.profile_image || undefined} className="object-cover" />
              <AvatarFallback className="font-bold text-lg bg-accent text-accent-foreground">
                {user.first_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <p className="text-xs text-muted-foreground/80 font-medium pt-1.5">{user.email}</p>
            </div>
          </div>

          {/* Counts Dashboard panel */}
          <div className="flex gap-4 text-center bg-muted/40 border border-border/40 rounded-2xl p-4.5 shadow-2xs select-none">
            <div className="flex-1">
              <div className="text-xl font-bold text-foreground leading-tight">{user.posts_count}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                {t('postsCount')}
              </div>
            </div>
            <div className="w-px bg-border/40 shrink-0 self-stretch" />
            <div className="flex-1">
              <div className="text-xl font-bold text-foreground leading-tight">{user.friends_count}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                {t('friendsCount')}
              </div>
            </div>
          </div>

          <hr className="border-border/40" />

          <ReferralLinkSection referralCode={user.referral_code} />
        </CardContent>
      </Card>

      {/* Posts Section */}
      <section className="space-y-5 pt-4">
        <div className="border-b border-border/30 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{t('myPosts')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('myPostsDesc')}</p>
        </div>
        <UserPostsSection />
      </section>
    </div>
  );
}
