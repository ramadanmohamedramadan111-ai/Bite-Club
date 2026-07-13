'use client';

import { PostDetailPage } from '@/components/social/posts/PostDetailPage';
import { useAddToIndividualCart } from '@/hooks/use-add-to-individual-cart';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSocialStore } from '@/stores/social';

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default function PostPage({ params }: PostPageProps) {
  const getPostById = useSocialStore((state) => state.getPostById);
  const { addFromPost, dialog } = useAddToIndividualCart();
  const [postId, setPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setPostId(p.postId));
  }, [params]);

  useEffect(() => {
    if (!postId) return;
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [postId]);

  const post = postId ? getPostById(postId) : undefined;

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <>
      <PostDetailPage
        post={post}
        onAddToCart={(value) => addFromPost(value, { redirect: true })}
      />
      {dialog}
    </>
  );
}
