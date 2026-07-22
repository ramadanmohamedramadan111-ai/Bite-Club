import { getTranslations } from 'next-intl/server';
import CreateGroupDialog from './CreateGroupDialog';

export default async function GroupsHeader() {
  const t = await getTranslations('groups');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      <CreateGroupDialog />
    </div>
  );
}

