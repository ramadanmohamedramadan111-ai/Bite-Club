'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import UserLoginForm from './UserLoginForm';
import RestaurantLoginForm from './RestaurantLoginForm';

export default function LoginTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('forms.login');

  const type = searchParams.get('type') ?? 'user';

  const handleChange = (value: string) => {
    router.replace(`/login?type=${value}`, {
      scroll: false,
    });
  };

  return (
    <Tabs value={type} onValueChange={handleChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="user">{t('tabs.user')}</TabsTrigger>

        <TabsTrigger value="restaurant">{t('tabs.restaurant')}</TabsTrigger>
      </TabsList>

      <TabsContent value="user">
        <UserLoginForm />
      </TabsContent>

      <TabsContent value="restaurant">
        <RestaurantLoginForm />
      </TabsContent>
    </Tabs>
  );
}

