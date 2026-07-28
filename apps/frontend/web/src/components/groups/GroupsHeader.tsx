import { getTranslations } from 'next-intl/server';
import CreateGroupDialog from './CreateGroupDialog';

export default async function GroupsHeader() {
  const t = await getTranslations('groups');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>
      <CreateGroupDialog />
    </div>
  );
}

