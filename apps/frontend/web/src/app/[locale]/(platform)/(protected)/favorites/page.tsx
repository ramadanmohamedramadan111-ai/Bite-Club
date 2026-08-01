import type { Metadata } from 'next';
import FavoritesPageView from '@/components/favorites/FavoritesPageView';

export default function FavoritesPage() {
  return <FavoritesPageView />;
}


export const metadata: Metadata = {
  title: "My Favorites | Bite Club",
  description: "Your favorite restaurants and dishes, handpicked and saved for quick access on Bite Club.",
};
