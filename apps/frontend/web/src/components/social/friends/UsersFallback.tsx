import { getTranslations } from 'next-intl/server';
import React from 'react';

export default async function UsersFallback() {
  const t = await getTranslations('common');

  return (
    <div
      className="
          py-10
          text-center
          text-muted-foreground
        ">
      {t('noUsersFound')}
    </div>
  );
}

