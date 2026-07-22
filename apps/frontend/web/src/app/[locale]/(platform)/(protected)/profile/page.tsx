import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api/api-response';
import type { UserResponse } from '@/types/profile/user';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import { UserPostsSection } from '@/components/social/posts/UserPostsSection';

async function getProfile(): Promise<UserResponse | null> {
  try {
    const res = await serverFetch<ApiResponse<UserResponse>>('/user/me');
    return res.data;
  } catch {
    return null;
  }
}

export default async function MyProfilePage() {
  const user = await getProfile();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Failed to load profile
      </div>
    );
  }

  return (
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
            <AvatarImage src={user.profile_image || undefined} />
            <AvatarFallback>
              {user.first_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-muted-foreground">@{user.username}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex gap-8 text-center">
          <div>
            <div className="text-lg font-semibold">{user.posts_count}</div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{user.friends_count}</div>
            <div className="text-xs text-muted-foreground">Friends</div>
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
        <UserPostsSection />
      </section>
    </div>
  );
}
