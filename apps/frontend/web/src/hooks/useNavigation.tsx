import { usePathname, useRouter } from '@/i18n/navigation';
import React from 'react';

export default function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(path: string) {
    if (pathname === path) {
      router.refresh();
    } else {
      router.push(path);
    }
  }

  return { navigate };
}

