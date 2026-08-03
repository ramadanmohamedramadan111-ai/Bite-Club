import type { Metadata } from 'next';
import LegalPageView from '@/components/legal/LegalPageView';

export default function PrivacyPolicyPage() {
  return <LegalPageView namespace="privacy" />;
}


export const metadata: Metadata = {
  title: "Privacy Policy | Bite Club",
  description: "Learn how Bite Club collects, uses, and protects your personal data.",
};
