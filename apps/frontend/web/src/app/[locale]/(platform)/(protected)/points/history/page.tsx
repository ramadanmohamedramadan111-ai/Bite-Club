import type { Metadata } from 'next';
import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const queryString = new URLSearchParams(sp as Record<string, string>).toString();
  const dest = `/points${queryString ? `?${queryString}` : ''}`;
  
  redirect({ href: dest, locale });
}

export const metadata: Metadata = {
  title: "Redirecting... | Bite Club",
  description: "Redirecting to rewards page.",
};
