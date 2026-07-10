'use client';

import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  icon: LucideIcon;
  url?: string;
  onClick?: () => void;
  badge?: number;
};

export function NavProjects({ projects }: { projects: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = item.url
            ? pathname === item.url || pathname.startsWith(`${item.url}/`)
            : false;

          const content = (
            <>
              <span className="relative">
                <item.icon />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground',
                      'group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:-top-1',
                    )}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span>{item.name}</span>
            </>
          );

          return (
            <SidebarMenuItem key={item.name}>
              {item.onClick ? (
                <SidebarMenuButton
                  type="button"
                  tooltip={item.name}
                  onClick={item.onClick}>
                  {content}
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}>
                  <Link href={item.url!}>{content}</Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
