import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export default function PointsPage() {
  redirect('/points/history');
}


export const metadata: Metadata = {
  title: "Bite Rewards | Bite Club",
  description: "Check your points balance, daily streaks, unlocked badges, and exchange them for gifts.",
};
