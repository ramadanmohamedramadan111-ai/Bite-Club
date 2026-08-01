import { getTranslations } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default async function FeedHeader() {
  const t = await getTranslations('feed');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          {t('socialFeed')}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t('socialFeedDesc')}
        </p>
      </div>
      <Link href="/posts/create">
        <Button className="shadow-md hover:shadow-lg transition-all duration-200">
          <Plus className="mr-2 h-5 w-5" />
          {t('createPost')}
        </Button>
      </Link>
    </div>
  );
}
