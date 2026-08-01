import type { Metadata } from 'next';
import LegalPageView from '@/components/legal/LegalPageView';

export default function TermsOfServicePage() {
  return <LegalPageView namespace="terms" />;
}


export const metadata: Metadata = {
  title: "Terms of Service | Bite Club",
  description: "Read the terms and conditions for using Bite Club.",
};
