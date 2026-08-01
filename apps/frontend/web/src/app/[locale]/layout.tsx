import type { Metadata } from 'next';
import '../globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';
import { getLangDir } from 'rtl-detect';
import NextLoader from 'nextjs-rtl-loader';
import { contentFont, headFont } from '@/utils/fonts';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GoogleMapsProvider } from '@/providers/GoogleMapProvider';
import SessionProvider from '@/providers/SessionProvider';
import NotificationProvider from '@/providers/NotificationProvider';

export const metadata: Metadata = {
  title: 'Bite Club - Social Food & Group Ordering',
  description: 'The social food ordering platform. Start group orders with friends, split costs, share posts, and earn daily rewards.',
  icons: {
    icon: '/logo.png',
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();
  const direction = getLangDir(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={`${contentFont.variable} ${headFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {direction === 'rtl' ? (
          <NextLoader
            zIndex={99999999999999}
            color="var(--primary)"
            height={6}
            showSpinner={true}
          />
        ) : (
          <NextTopLoader
            zIndex={99999999999999}
            color="var(--primary)"
            height={6}
            showSpinner={true}
          />
        )}

        <Toaster position="top-center" richColors />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <ThemeProvider>
              <GoogleMapsProvider>
                <TooltipProvider>
                  <SessionProvider>
                    <NotificationProvider>{children}</NotificationProvider>
                  </SessionProvider>
                </TooltipProvider>
              </GoogleMapsProvider>
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

