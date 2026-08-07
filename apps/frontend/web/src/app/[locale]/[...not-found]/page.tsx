import type { Metadata } from 'next';
import React from 'react';
import { getTranslations } from 'next-intl/server';
import NotFound from '../not-found';

export default function page() {
  return <NotFound />;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('notFound.title'),
    description: t('notFound.description'),
  };
}