import type { Metadata } from 'next';
import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api';
import type { UserResponse } from '@/types/user';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';

async function getProfile(): Promise<UserResponse | null> {
  try {
    const res = await serverFetch<ApiResponse<UserResponse>>('/user/me');
    return res.data;
  } catch {
    return null;
  }
}

export default async function EditProfilePage() {
  const t = await getTranslations('editProfile');
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
      {/* Back navigation and header text */}
      <div className="flex items-center gap-4 border-b border-border/30 pb-6">
        <Link href="/profile" className="cursor-pointer shrink-0">
          <Button variant="outline" size="icon" className="rounded-xl border-border/50 bg-background/50 hover:bg-background shadow-xs cursor-pointer">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <ProfileEditForm user={user} />
    </div>
  );
}


export const metadata: Metadata = {
  title: "Edit Profile Details | Bite Club",
  description: "Update your name, contact information, and personal settings.",
};
