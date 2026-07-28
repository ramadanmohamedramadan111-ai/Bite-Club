'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import UserLoginForm from './UserLoginForm';
import RestaurantLoginForm from './RestaurantLoginForm';

export default function LoginTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type') ?? 'user';

  const handleChange = (value: string) => {
    router.replace(`/login?type=${value}`, {
      scroll: false,
    });
  };

  return (
    <Tabs value={type} onValueChange={handleChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted/45 border border-border/40 p-1.5 rounded-2xl h-auto mb-4">
        <TabsTrigger value="user" className="rounded-xl py-2 px-4 text-sm font-bold transition-all duration-300">
          User
        </TabsTrigger>
        <TabsTrigger value="restaurant" className="rounded-xl py-2 px-4 text-sm font-bold transition-all duration-300">
          Restaurant
        </TabsTrigger>
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
