import { getTranslations } from 'next-intl/server';

export default async function GroupHistoryTab() {
  const t = await getTranslations('groups');

  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground">
        {t('orderHistoryEmpty')}
      </p>
    </div>
  );
}
