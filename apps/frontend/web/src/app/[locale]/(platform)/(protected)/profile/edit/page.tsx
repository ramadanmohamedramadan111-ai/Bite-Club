import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api/api-response';
import type { UserResponse } from '@/types/profile/user';
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
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {tc('failedToLoad')}
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <ProfileEditForm user={user} />
    </div>
  );
}
