import { getTranslations } from 'next-intl/server';
import PointsBalanceCard from '@/components/points/PointsBalanceCard';
import PointsTabs from '@/components/points/PointsTabs';

export default async function PointsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('points');

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <PointsBalanceCard />

      <PointsTabs />

      {children}
    </div>
  );
}

