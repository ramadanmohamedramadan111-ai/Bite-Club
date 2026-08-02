import type { Metadata } from 'next';
import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id, locale } = await params;
  const sp = await searchParams;
  const queryString = new URLSearchParams(sp as Record<string, string>).toString();
  const dest = `/groups/${id}${queryString ? `?${queryString}` : ''}`;
  
  redirect({ href: dest, locale });
}

export const metadata: Metadata = {
  title: "Redirecting... | Bite Club",
  description: "Redirecting to group details page.",
};
