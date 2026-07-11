'use client';

import { useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import { UserProfilePosts } from '@/components/social/posts/UserProfilePosts';
import { useSocialStore } from '@/stores/social';
import { useAddToIndividualCart } from '@/hooks/use-add-to-individual-cart';

export default function MyProfilePage() {
  const profile = useSocialStore((state) => state.profile);
  const allPosts = useSocialStore((state) => state.posts);
  const { addFromPost, dialog } = useAddToIndividualCart();
  const userPosts = useMemo(
    () => allPosts.filter((post) => post.authorId === profile.id),
    [allPosts, profile.id],
  );

  return (
    <>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="mt-2 text-muted-foreground">Your posts and activity</p>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-lg rounded-lg border p-6">
          <div className="mb-6 flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </div>

          <div className="flex gap-8 text-center">
            <div>
              <div className="text-lg font-semibold">{userPosts.length}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-lg font-semibold">12.4K</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-lg font-semibold">850</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">My Posts</h2>
            <p className="text-sm text-muted-foreground">
              Meals and orders you have shared
            </p>
          </div>
          <UserProfilePosts
            userId={profile.id}
            onAddToCart={(post) => addFromPost(post, { redirect: true })}
          />
        </section>
      </div>
      {dialog}
    </>
  );
}
