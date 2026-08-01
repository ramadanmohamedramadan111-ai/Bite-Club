import type { Metadata } from 'next';
import PostsFeed from '@/components/posts/PostsFeed';

export default function PostsPage() {
  return <PostsFeed />;
}



export const metadata: Metadata = {
  title: "Posts Feed | Bite Club",
  description: "Check out food posts and shared meals from the Bite Club community.",
};
