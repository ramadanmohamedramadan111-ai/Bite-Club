'use client';

import { Monitor, Moon, PaintbrushVertical, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <PaintbrushVertical className="size-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-40 p-1">
        <div className="flex flex-col">
          <Button
            variant={theme === 'light' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => setTheme('light')}>
            <Sun className="mr-2 size-4" />
            Light
          </Button>

          <Button
            variant={theme === 'dark' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => setTheme('dark')}>
            <Moon className="mr-2 size-4" />
            Dark
          </Button>

          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => setTheme('system')}>
            <Monitor className="mr-2 size-4" />
            System
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

