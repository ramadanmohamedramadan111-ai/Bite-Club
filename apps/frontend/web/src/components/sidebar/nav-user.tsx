'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  ChevronsUpDownIcon,
  BellIcon,
  LogOutIcon,
  User,
  CircleUserRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { capitalize } from '@/utils/format';
import { Link, useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { logoutUserAction } from '@/actions/auth/logout';
import { toast } from 'sonner';

export interface SidebarUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
}

interface NavUserProps {
  user: SidebarUser | null;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslations('userPanel');

  const { execute: logout, isExecuting } = useAction(logoutUserAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? t('loggedOutSuccess'));

      router.replace('/login');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message ?? t('logoutFailed'));
    },
  });
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={t('login')}>
            <Link href="/login">
              <User className="size-5 shrink-0" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                {t('login')}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.profile_image ?? undefined}
                  alt={user.first_name}
                />
                <AvatarFallback className="rounded-lg">
                  {(
                    (user.first_name?.charAt(0) ?? '') +
                    (user.last_name?.charAt(0) ?? '')
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {`${capitalize(user.first_name ?? '')} ${capitalize(
                    user.last_name ?? '',
                  )}`}{' '}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.profile_image ?? undefined}
                    alt={user.first_name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {(
                      (user.first_name?.charAt(0) ?? '') +
                      (user.last_name?.charAt(0) ?? '')
                    ).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {' '}
                    {`${capitalize(user.first_name ?? '')} ${capitalize(
                      user.last_name ?? '',
                    )}`}{' '}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <CircleUserRound />
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications">
                  <BellIcon />
                  {t('notifications')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => logout()}>
              <LogOutIcon />
              {isExecuting ? t('loggingOut') : t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

