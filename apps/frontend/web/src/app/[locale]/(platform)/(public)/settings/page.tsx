import type { Metadata } from 'next';
import SettingsPageView from '@/components/settings/SettingsPageView';

export default function SettingsPage() {
  return <SettingsPageView />;
}


export const metadata: Metadata = {
  title: "Account Settings | Bite Club",
  description: "Configure your account settings, localization preferences, and notifications.",
};
