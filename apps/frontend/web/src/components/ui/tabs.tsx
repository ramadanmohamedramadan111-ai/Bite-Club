'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { useLocale } from 'next-intl';
import { getLangDir } from 'rtl-detect';

import { cn } from '@/lib/utils';

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const locale = useLocale();
  const direction = getLangDir(locale);

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      dir={direction}
      className={cn(
        'group/tabs flex gap-4 data-[orientation=horizontal]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex items-center justify-center rounded-xl p-1 text-muted-foreground transition-all duration-300 group-data-[orientation=horizontal]/tabs:h-11 group-data-[orientation=vertical]/tabs:h-auto group-data-[orientation=vertical]/tabs:flex-col',
  {
    variants: {
      variant: {
        default: 'bg-muted/70 backdrop-blur-xs border border-border/40 shadow-xs w-full sm:w-auto',
        line: 'gap-6 bg-transparent border-b border-border/40 w-full justify-start rounded-none px-0 h-auto p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // General Layout & Typography
        'relative inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer select-none flex-1 sm:flex-initial',
        'text-muted-foreground/80 hover:text-foreground',
        'disabled:pointer-events-none disabled:opacity-40',
        
        // Focus styles
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        
        // Default Variant Active State
        'group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:text-primary group-data-[variant=default]/tabs-list:data-[state=active]:shadow-md',
        'dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-muted dark:group-data-[variant=default]/tabs-list:data-[state=active]:text-primary',
        
        // Line Variant Active State
        'group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:pb-3 group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:data-[state=active]:text-primary group-data-[variant=line]/tabs-list:data-[state=active]:font-semibold',
        
        // Underline Indicator for Line Variant
        'after:absolute after:bg-primary after:opacity-0 after:transition-all after:duration-300',
        'group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-0 group-data-[orientation=horizontal]/tabs:after:h-[3px] group-data-[orientation=horizontal]/tabs:after:rounded-t-full',
        'group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5',
        'group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 group-data-[variant=line]/tabs-list:data-[state=active]:after:shadow-[0_-2px_10px_var(--color-primary)]',
        
        // Icons scaling
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4.5',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 text-sm outline-none mt-4 transition-all duration-300 animate-in fade-in-30 slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
