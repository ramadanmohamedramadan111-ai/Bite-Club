import { getTranslations } from 'next-intl/server';
import PointsBalanceCard from '@/components/points/PointsBalanceCard';
import PointsTabs from '@/components/points/PointsTabs';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api';
import { UserMeResponse } from '@/types/auth';
import ReferralLinkSection from '@/components/profile/ReferralLinkSection';

export default async function PointsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('points');

  const res = await serverFetch<ApiResponse<UserMeResponse>>(
    '/user/me',
    'GET',
    {
      skipRefresh: true,
    },
  );
  const user = res.data;

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <PointsBalanceCard />
      <ReferralLinkSection referralCode={user?.referral_code} />

      <PointsTabs />

      {children}
    </div>
  );
}

