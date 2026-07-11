'use client';

import { ActivityFeedPage } from '@/components/social/posts/ActivityFeedPage';
import { useAddToIndividualCart } from '@/hooks/use-add-to-individual-cart';

export default function FeedPage() {
  const { addFromPost, dialog } = useAddToIndividualCart();

  return (
    <>
      <ActivityFeedPage
        onAddToCart={(post) => addFromPost(post, { redirect: true })}
      />
      {dialog}
    </>
  );
}
