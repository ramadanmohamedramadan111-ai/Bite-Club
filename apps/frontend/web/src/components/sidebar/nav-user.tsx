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
import { clientFetch } from '@/utils/client-fetch';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronsUpDownIcon,
  SparklesIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  RefreshCw,
  User,
  CircleUserRound,
} from 'lucide-react';
import { Spinner } from '../ui/spinner';
import { QueryBoundary } from '../fetch/QueryBoundary';
import { capitalize } from '@/utils/format';
import { deleteCookie } from 'cookies-next/client';
import { Link, useRouter } from '@/i18n/navigation';

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const { data, isPending, error, refetch } = useQuery({
    queryFn: async () => {
      const res = await clientFetch('/api/user/me');
      return res;
    },
    queryKey: ['me'],
  });

  console.log('NavUser data:', data);

  function logout() {
    deleteCookie('accessToken');

    router.replace('/login');
  }

  if (!isPending && (!data?.data?.user || error)) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={() => router.push('/login')}>
            <User className="size-5" />
            <span className="text-sm font-medium">Login</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <QueryBoundary isPending={isPending} error={error} refetch={refetch}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={data?.data.user.profileImage}
                    alt={data?.data.user.firstName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {data?.data.user.firstName.charAt(0).toUpperCase() +
                      data?.data.user.lastName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {`${capitalize(data?.data.user.firstName ?? '')} ${capitalize(
                      data?.data.user.lastName ?? '',
                    )}`}{' '}
                  </span>
                  <span className="truncate text-xs">
                    {data?.data.user.email}
                  </span>
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
                      src={data?.data.user.profileImage}
                      alt={data?.data.user.firstName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {data?.data.user.firstName.charAt(0).toUpperCase() +
                        data?.data.user.lastName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {' '}
                      {`${capitalize(data?.data.user.firstName ?? '')} ${capitalize(
                        data?.data.user.lastName ?? '',
                      )}`}{' '}
                    </span>
                    <span className="truncate text-xs">
                      {data?.data.user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <CircleUserRound />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications">
                    <BellIcon />
                    Notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => logout()}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </QueryBoundary>
  );
}

