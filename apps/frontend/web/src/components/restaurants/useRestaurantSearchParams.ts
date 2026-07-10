'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useRestaurantSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      params.delete('page');
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      updateParams((params) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
    },
    [updateParams],
  );

  const setBooleanParam = useCallback(
    (key: string, checked: boolean) => {
      setParam(key, checked ? 'true' : null);
    },
    [setParam],
  );

  const toggleCategory = useCallback(
    (category: string, selected: string[]) => {
      const next = selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category];
      setParam('category', next.length > 0 ? next.join(',') : null);
    },
    [setParam],
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return {
    updateParams,
    setParam,
    setBooleanParam,
    toggleCategory,
    clearFilters,
    searchParams,
  };
}
