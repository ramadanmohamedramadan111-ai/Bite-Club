'use client';

import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

import { Search, SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { useEffect, useState } from 'react';

import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';

export default function SearchUsers() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  const [debouncedValue] = useDebounce(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedValue) {
      params.set('search', debouncedValue);
    } else {
      params.delete('search');
    }

    router.replace(`/friends?${params.toString()}`);
  }, [debouncedValue]);

  return (
    <div className="relative">
      <Input
        name="search"
        type="search"
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search..."
        className="md:pr-10 pr-0"
      />

      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1/2 size-8 -translate-y-1/2 md:flex hidden">
        <SearchIcon className="size-4" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
}

