'use client';

import { UserProfilePosts } from '@/components/social/posts/UserProfilePosts';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSocialStore } from '@/stores/social';
import { useAddToIndividualCart } from '@/hooks/use-add-to-individual-cart';

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const getUserByUsername = useSocialStore((state) => state.getUserByUsername);
  const { addFromPost, dialog } = useAddToIndividualCart();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setUsername(p.username));
  }, [params]);

  useEffect(() => {
    if (!username) return;
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, [username]);

  const user = username ? getUserByUsername(username) : undefined;

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto flex items-center justify-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/feed">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <div className="mx-auto max-w-lg rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Posts</h2>
            <p className="text-sm text-muted-foreground">
              Meals and orders shared by {user.name}
            </p>
          </div>
          <UserProfilePosts
            userId={user.id}
            onAddToCart={(post) => addFromPost(post, { redirect: true })}
          />
        </section>
      </div>
      {dialog}
    </>
  );
}
