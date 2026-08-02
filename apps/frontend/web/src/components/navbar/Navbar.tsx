'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getLangDir } from 'rtl-detect';
import {
  House,
  Utensils,
  Logs,
  Coins,
  Users,
  CircleUserRound,
  Handshake,
  Newspaper,
  Heart,
  Settings,
  Menu,
  ChevronDown,
  LogOutIcon,
  User,
  BellIcon,
  ShoppingCartIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { logoutUserAction } from '@/actions/auth';
import { capitalize } from '@/utils/format';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { getEcho } from '@/lib/echo';
import { revalidateNotifications } from '@/actions/notifications';
import type { Notification } from '@/types/notifications';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import CartButton from '@/components/cart/CartButton';
import NotificationPopover from './NotificationPopover';
import GroupOrderSessionsButton from './GroupOrderSessionsButton';

export interface SidebarUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
}

interface BroadcastNotification {
  id: string;
  type: string;
  title?: string;
  body?: string;
  action_url?: string;
  order_id?: number | null;
  restaurant_name?: string | null;
}

interface NavbarProps {
  user: SidebarUser | null;
  friendsRequestsCount: number;
  unreadNotificationsCount: number;
  recentNotifications: Notification[];
  locationButton?: React.ReactNode;
  searchForm?: React.ReactNode;
  gamificationPopover?: React.ReactNode;
  accessToken?: string | null;
}

export default function Navbar({
  user,
  friendsRequestsCount,
  unreadNotificationsCount,
  recentNotifications,
  locationButton,
  searchForm,
  gamificationPopover,
  accessToken,
}: NavbarProps) {
  const locale = useLocale();
  const direction = getLangDir(locale);
  const isRtl = direction === 'rtl';
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const t = useTranslations('userPanel');
  const tSidebar = useTranslations('sidebar');

  const [isOpenMobile, setIsOpenMobile] = React.useState(false);
  const [isLevelTwoOpen, setIsLevelTwoOpen] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    const echo = getEcho(accessToken);

    const channelName = `App.Models.User.${user.id}`;
    console.log(`[Echo-Navbar] Joining private channel: ${channelName}`);

    const channel = echo.private(channelName);

    const orderNotificationTypes = [
      'order_preparing',
      'order_ready',
      'order_out_for_delivery',
      'order_completed',
      'order_cancelled',
      'order_cancelled_timeout',
    ];

    channel.notification((notification: BroadcastNotification) => {
      const type = notification?.type;

      if (type && orderNotificationTypes.includes(type)) {
        console.log(`[Echo-Navbar] Order notification received:`, notification);

        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});

        // Show toast notification
        const title = notification.title || 'Order Update';
        const body = notification.body || 'Your order has been updated';
        const actionUrl = notification.action_url;

        const handleToastClick = () => {
          if (actionUrl) {
            window.location.href = actionUrl;
          }
        };

        toast.success(
          <button
            type="button"
            onClick={handleToastClick}
            className="flex flex-col gap-1 text-left">
            <span className="font-semibold">{title}</span>
            <span className="text-xs text-muted-foreground">{body}</span>
          </button>,
        );

        // Revalidate notifications on server so the layout refetches fresh data
        revalidateNotifications();
      }
    });

    return () => {
      console.log(`[Echo-Navbar] Leaving private channel: ${channelName}`);
      echo.leave(channelName);
    };
  }, [user?.id, accessToken]);

  // Update the browser tab title with the unread notifications count
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const cleanTitle = document.title.replace(/^\(\d+\)\s*/, '');
    document.title =
      unreadNotificationsCount > 0
        ? `(${unreadNotificationsCount}) ${cleanTitle}`
        : cleanTitle;
  }, [unreadNotificationsCount, pathname]);

  const itemCount = useCartStore(
    (state) =>
      state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );

  const { execute: logout, isExecuting } = useAction(logoutUserAction, {
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? t('loggedOutSuccess'));
      useCartStore.getState().clearCart();
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message ?? t('logoutFailed'));
    },
    onSettled: () => {
      router.replace('/login');
    },
  });

  const isCheckout = pathname.endsWith('/checkout');

  const isActive = (url: string) => {
    if (url === '/') {
      return pathname === '/';
    }
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const primaryLinks = [
    { name: tSidebar('home'), url: '/' },
    { name: tSidebar('restaurants'), url: '/restaurants' },
    ...(user
      ? [
          { name: tSidebar('orders'), url: '/orders' },
          { name: tSidebar('groups'), url: '/groups' },
          { name: tSidebar('feed'), url: '/posts' },
        ]
      : []),
  ];

  const secondaryLinks = user
    ? [
        {
          name: tSidebar('friends'),
          url: '/friends',
          icon: Handshake,
          badge: friendsRequestsCount,
        },
        // { name: tSidebar('favorites'), url: '/favorites', icon: Heart },
        { name: tSidebar('points'), url: '/points', icon: Coins },
        { name: tSidebar('settings'), url: '/settings', icon: Settings },
      ]
    : [{ name: tSidebar('settings'), url: '/settings', icon: Settings }];

  const mobileLinks = [
    { name: tSidebar('home'), url: '/', icon: House },
    { name: tSidebar('restaurants'), url: '/restaurants', icon: Utensils },
    ...(user
      ? [
          { name: tSidebar('orders'), url: '/orders', icon: Logs },
          { name: tSidebar('groups'), url: '/groups', icon: Users },
          { name: tSidebar('feed'), url: '/posts', icon: Newspaper },
          {
            name: tSidebar('friends'),
            url: '/friends',
            icon: Handshake,
            badge: friendsRequestsCount,
          },
          // { name: tSidebar('favorites'), url: '/favorites', icon: Heart },
          { name: tSidebar('points'), url: '/points', icon: Coins },
          {
            name: tSidebar('notifications'),
            url: '/notifications',
            icon: BellIcon,
            badge: unreadNotificationsCount,
          },
        ]
      : []),
    { name: tSidebar('settings'), url: '/settings', icon: Settings },
    ...(isCheckout
      ? []
      : [
          {
            name: tSidebar('cart'),
            url: '/cart',
            icon: ShoppingCartIcon,
            badge: itemCount,
          },
        ]),
  ];

  const secondaryActive = secondaryLinks.some((link) => isActive(link.url));
  const moreText = locale === 'ar' ? 'المزيد' : 'More';

  // Toggle Language Handler
  const handleLocaleToggle = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  // Toggle Theme Handler
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full relative bg-gradient-to-b from-background via-background/98 to-primary/[0.02] backdrop-blur-md shadow-[0_2px_20px_-10px_rgba(0,0,0,0.03)] transition-all duration-300">
      {/* Top glowing separator border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      {/* LEVEL 1: Main Branding & Top level Navigation */}
      <div className="max-w-7xl mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 md:px-8 xl:px-12 gap-2 sm:gap-4">
        {/* Desktop Level 1 */}
        <div className="hidden xl:flex w-full items-center justify-between">
          {/* Brand Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden border border-primary/15 bg-primary/5 shadow-[0_3px_10px_-3px_var(--color-primary)]">
                <img
                  src="/logo.png"
                  alt="Bite Club"
                  className="size-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                BiteClub
              </span>
            </Link>

            <nav className="flex items-stretch h-16 gap-1.5">
              {primaryLinks.map((link) => {
                const active = isActive(link.url);
                return (
                  <Link
                    key={link.url}
                    href={link.url}
                    className={cn(
                      'relative flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-accent/40',
                      active
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground',
                    )}>
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_8px_var(--color-primary)] animate-pulse" />
                    )}
                  </Link>
                );
              })}

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-accent/40 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none',
                        secondaryActive && 'text-primary font-semibold',
                      )}>
                      <span>{moreText}</span>
                      <ChevronDown className="size-4 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      {friendsRequestsCount > 0 && (
                        <span className="size-2 rounded-full bg-primary animate-ping" />
                      )}
                      {secondaryActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_8px_var(--color-primary)]" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-52 p-1.5 backdrop-blur-md bg-background/95 border border-border shadow-xl rounded-xl">
                    {secondaryLinks.map((link) => (
                      <DropdownMenuItem
                        key={link.url}
                        asChild
                        className="rounded-lg">
                        <Link
                          href={link.url}
                          className={cn(
                            'flex items-center justify-between w-full cursor-pointer px-3 py-2 text-sm transition-colors duration-150',
                            isActive(link.url)
                              ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                          )}>
                          <div className="flex items-center gap-2.5">
                            <link.icon className="size-4 opacity-85" />
                            <span>{link.name}</span>
                          </div>
                          {link.badge !== undefined && link.badge > 0 && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                              {link.badge > 99 ? '99+' : link.badge}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          </div>

          {/* Right Action panel */}
          <div className="flex items-center gap-4">
            {/* Collapse Toggle Button for Level 2 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLevelTwoOpen(!isLevelTwoOpen)}
              title={isLevelTwoOpen ? 'Collapse options' : 'Expand options'}
              className="h-9 w-9 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/60">
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-200',
                  isLevelTwoOpen && 'rotate-180',
                )}
              />
            </Button>

            {/* Icons, Buttons & Toggles */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <NotificationPopover
                    unreadCount={unreadNotificationsCount}
                    recentNotifications={recentNotifications}
                  />
                  <GroupOrderSessionsButton />
                  {!isCheckout && <CartButton className="hover:bg-accent/60" />}
                </>
              )}
              {!user && !isCheckout && (
                <CartButton className="hover:bg-accent/60" />
              )}

              {/* Language AR/EN Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLocaleToggle}
                className="h-9 px-3 rounded-lg font-bold text-xs uppercase text-muted-foreground hover:text-foreground hover:bg-accent/60">
                {locale === 'ar' ? 'EN' : 'العربية'}
              </Button>

              {/* Theme Sun/Moon Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                className="relative h-9 w-9 rounded-lg cursor-pointer hover:bg-accent/60">
                <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground hover:text-foreground" />
                <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Toggle Theme</span>
              </Button>
            </div>

            {/* Profile Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all p-0">
                    <Avatar className="h-9 w-9 rounded-full border border-border">
                      <AvatarImage
                        src={user.profile_image ?? undefined}
                        alt={user.first_name}
                      />
                      <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/10 to-orange-500/10 text-primary font-semibold">
                        {(
                          (user.first_name?.charAt(0) ?? '') +
                          (user.last_name?.charAt(0) ?? '')
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-60 p-1.5 backdrop-blur-md bg-background/95 border border-border shadow-xl rounded-xl"
                  align="end"
                  forceMount>
                  <DropdownMenuLabel className="font-normal p-2.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {`${capitalize(user.first_name ?? '')} ${capitalize(user.last_name ?? '')}`}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem
                      asChild
                      className="rounded-lg cursor-pointer">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5">
                        <CircleUserRound className="size-4 text-muted-foreground" />
                        <span>{t('profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-lg cursor-pointer">
                      <Link
                        href="/notifications"
                        className="flex items-center justify-between w-full gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <BellIcon className="size-4 text-muted-foreground" />
                          <span>{t('notifications')}</span>
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full scale-90 border-none shrink-0">
                            {unreadNotificationsCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="m-1 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    disabled={isExecuting}
                    onClick={() => logout()}>
                    <LogOutIcon className="mr-2 size-4" />
                    <span>{isExecuting ? t('loggingOut') : t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="cursor-pointer bg-gradient-to-r from-primary to-orange-600 text-white shadow-md hover:shadow-lg transition-all rounded-lg">
                <Link href="/login">
                  <User className="mr-2 size-4" />
                  <span>{t('login')}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Level 1 Display */}
        <div className="flex xl:hidden w-full items-center justify-between gap-2.5">
          {/* Mobile Left: Hamburger and Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Sheet open={isOpenMobile} onOpenChange={setIsOpenMobile}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8.5 sm:size-9 cursor-pointer hover:bg-accent/60">
                  <Menu className="size-4.5 sm:size-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRtl ? 'right' : 'left'}
                className="w-[310px] flex flex-col p-0 bg-background border-r border-border">
                <SheetHeader className="p-5 border-b border-border">
                  <SheetTitle className="text-start">
                    <Link
                      href="/"
                      className="flex items-center gap-2.5"
                      onClick={() => setIsOpenMobile(false)}>
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden border border-primary/15 bg-primary/5 shadow-[0_2px_8px_-2px_var(--color-primary)]">
                        <img
                          src="/logo.png"
                          alt="Bite Club"
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                        BiteClub
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {user ? (
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-accent/40 border border-border/10">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage
                          src={user.profile_image ?? undefined}
                          alt={user.first_name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {(
                            (user.first_name?.charAt(0) ?? '') +
                            (user.last_name?.charAt(0) ?? '')
                          ).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate leading-tight text-foreground">
                          {`${capitalize(user.first_name ?? '')} ${capitalize(user.last_name ?? '')}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      asChild
                      className="w-full cursor-pointer bg-gradient-to-r from-primary to-orange-600 text-white rounded-xl shadow-md"
                      onClick={() => setIsOpenMobile(false)}>
                      <Link href="/login">
                        <User className="mr-2 size-4" />
                        <span>{t('login')}</span>
                      </Link>
                    </Button>
                  )}

                  <nav className="flex flex-col gap-1.5">
                    {mobileLinks.map((link) => (
                      <Link
                        key={link.url}
                        href={link.url}
                        onClick={() => setIsOpenMobile(false)}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent',
                          isActive(link.url)
                            ? 'bg-primary/10 text-primary font-semibold border-primary/10'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}>
                        <div className="flex items-center gap-3.5">
                          <link.icon className="size-5 opacity-80" />
                          <span>{link.name}</span>
                        </div>
                        {link.badge !== undefined && link.badge > 0 && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                            {link.badge > 99 ? '99+' : link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </nav>

                  <Separator className="border-border" />

                  {/* Settings toggles directly in Mobile Drawer */}
                  <div className="space-y-3 px-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {locale === 'ar'
                        ? 'الإعدادات والمظهر'
                        : 'Settings & Appearance'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLocaleToggle}
                        className="h-10 px-4 rounded-xl font-bold text-xs uppercase border-border text-muted-foreground hover:text-foreground">
                        {locale === 'ar' ? 'English (EN)' : 'العربية (AR)'}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleThemeToggle}
                        className="relative h-10 w-10 rounded-xl border-border cursor-pointer">
                        <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
                        <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="p-5 border-t border-border mt-auto bg-background/50">
                    <Button
                      variant="outline"
                      className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-2 cursor-pointer rounded-xl h-10 transition-colors"
                      disabled={isExecuting}
                      onClick={() => {
                        setIsOpenMobile(false);
                        logout();
                      }}>
                      <LogOutIcon className="size-4" />
                      <span>{isExecuting ? t('loggingOut') : t('logout')}</span>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex aspect-square size-7 sm:size-7.5 items-center justify-center rounded-lg overflow-hidden border border-primary/15 bg-primary/5 shadow-sm">
                <img
                  src="/logo.png"
                  alt="Bite Club"
                  className="size-full object-cover"
                />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent hidden xs:inline">
                BiteClub
              </span>
            </Link>
          </div>

          {/* Mobile Right: All requested toggles + icons (Cart, Notification, Language, Theme, Collapse) */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {user && (
              <>
                <NotificationPopover
                  unreadCount={unreadNotificationsCount}
                  recentNotifications={recentNotifications}
                />
                <GroupOrderSessionsButton />
              </>
            )}
            {!isCheckout && <CartButton className="hover:bg-accent/60" />}

            {/* Language AR/EN Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLocaleToggle}
              className="h-8.5 px-1 rounded-lg font-bold text-2xs sm:text-xs uppercase text-muted-foreground hover:text-foreground">
              {locale === 'ar' ? 'EN' : 'AR'}
            </Button>

            {/* Theme Sun/Moon Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="relative h-8.5 w-8.5 rounded-lg hover:bg-accent/60 cursor-pointer">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
              <span className="sr-only">Toggle Theme</span>
            </Button>

            {/* Collapse toggle for Level 2 on Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLevelTwoOpen(!isLevelTwoOpen)}
              className="h-8.5 w-8.5 rounded-lg cursor-pointer text-muted-foreground hover:bg-accent/60">
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  isLevelTwoOpen && 'rotate-180',
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      {isLevelTwoOpen && (
        <div className="relative w-full border-t border-border bg-gradient-to-r from-muted/50 via-primary/[0.03] to-orange-500/[0.03]">
          {/* Top glowing separator border inside level 2 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 md:px-8 xl:px-12 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            {/* Left Side: Location & Search bar (NEXT to location, not in the middle) */}
            <div className=" flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
              {/* Location Selector (Doesn't shrink) */}
              <div className="shrink-0 flex-shrink-0">{locationButton}</div>

              {/* Search Bar next to location */}
              {searchForm && (
                <div className="w-full sm:max-w-md">{searchForm}</div>
              )}
            </div>

            {/* Right Side: Points Display (Gamification Popover) */}
            <div className="flex items-center shrink-0 justify-end">
              {gamificationPopover}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

