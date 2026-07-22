'use client';

import { useEffect, useState } from 'react';
import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { PostCard } from './PostCard';
import { PostType } from '@/types/social/posts';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { Loader2, Plus, Trophy, Award, Crown, Zap } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { useAction } from 'next-safe-action/hooks';
import { copyOrderAction } from '@/actions/feed';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface PostsResponse {
  posts: PostType[];
  nextCursor?: string;
}

interface LeaderboardUser {
  id: number;
  name: string;
  username: string;
  profile_image_url: string | null;
}

interface LeaderboardItem {
  id: number;
  rank: number;
  user: LeaderboardUser;
  copies: number;
  reward_points: number;
  type: string;
  period_start: string;
  period_end: string;
}

export default function FeedClientView() {
  const router = useRouter();
  const t = useTranslations('feed');
  const tc = useTranslations('common');
  const [activeMainTab, setActiveMainTab] = useState<'posts' | 'leaderboard'>(
    'posts',
  );

  // Posts Feed Infinite Scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
  } = useInfinitePosts('/api/posts');

  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    if (!observedElement || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElement, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page: any) => page.posts) ?? [];

  // Leaderboard fetching
  const { data: leaderboardResponse, isLoading: isLoadingLeaderboard } =
    useQuery<ApiResponse<PaginatedResponse<LeaderboardItem>>>({
      queryKey: ['leaderboard', 'weekly'],
      queryFn: () =>
        clientFetch<ApiResponse<PaginatedResponse<LeaderboardItem>>>(
          '/api/leaderboard?type=weekly',
        ),
      enabled: activeMainTab === 'leaderboard',
    });

  // Copy order server action
  const { execute: copyOrder, isExecuting: isCopying } = useAction(
    copyOrderAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(
            data.message || tc('copySuccess'),
          );
          router.push('/cart');
        } else {
          toast.error(data?.message || tc('copyFailed'));
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message || tc('copyFailed'));
      },
    },
  );

  const handleAddToCart = (post: PostType) => {
    copyOrder(Number(post.id));
  };

  // Extract top 3 and others for leaderboard podium
  const leaderboardItems = leaderboardResponse?.data?.items || [];
  const top1 = leaderboardItems.find((item) => item.rank === 1);
  const top2 = leaderboardItems.find((item) => item.rank === 2);
  const top3 = leaderboardItems.find((item) => item.rank === 3);
  const remainingLeaderboard = leaderboardItems.filter((item) => item.rank > 3);

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            {t('socialFeed')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('socialFeedDesc')}
          </p>
        </div>
        <Link href="/feed/create">
          <Button className="shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="mr-2 h-5 w-5" />
            {t('createPost')}
          </Button>
        </Link>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeMainTab}
        onValueChange={(v) => setActiveMainTab(v as 'posts' | 'leaderboard')}
        className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/60 rounded-xl">
          <TabsTrigger value="posts" className="rounded-lg transition-all">
            {t('postsFeed')}
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="rounded-lg transition-all flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            {t('leaderboard')}
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab Content */}
        <TabsContent value="posts" className="mt-6 focus-visible:outline-none">
          {isLoadingPosts ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{tc('loadingPosts')}</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {hasNextPage && (
                <div
                  ref={setObservedElement}
                  className="flex justify-center py-8">
                  {isFetchingNextPage && (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  )}
                </div>
              )}

              {!hasNextPage && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {tc('reachedEndOfFeed')}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-16 text-center">
              <p className="text-muted-foreground">
                {tc('noPostsFeed')}
              </p>
              <Link href="/feed/create" className="mt-4 inline-block">
                <Button variant="outline">{tc('shareFirstMeal')}</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab Content */}
        <TabsContent
          value="leaderboard"
          className="mt-6 focus-visible:outline-none">
          {isLoadingLeaderboard ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t('leaderboardLoading')}
              </p>
            </div>
          ) : leaderboardItems.length > 0 ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Podium for Top 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-8 max-w-3xl mx-auto">
                {/* 2nd Place */}
                <div className="order-2 sm:order-1 flex flex-col items-center">
                  {top2 && (
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="relative mb-2">
                        <Award className="h-7 w-7 text-slate-300 absolute -top-4 -right-1 drop-shadow" />
                        <Avatar className="h-20 w-20 border-4 border-slate-300 shadow-md">
                          <AvatarImage
                            src={top2.user.profile_image_url || undefined}
                          />
                          <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">
                            {top2.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                          2
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mt-2 line-clamp-1">
                        {top2.user.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        @{top2.user.username}
                      </p>
                      <div className="mt-2 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 border">
                        <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {top2.reward_points} pts
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {top2.copies} copies
                      </p>
                    </div>
                  )}
                </div>

                {/* 1st Place */}
                <div className="order-1 sm:order-2 flex flex-col items-center mb-6 sm:mb-0">
                  {top1 && (
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="relative mb-2 scale-110 sm:scale-125">
                        <Crown className="h-8 w-8 text-amber-500 fill-amber-500 absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-md animate-bounce duration-1000" />
                        <Avatar className="h-24 w-24 border-4 border-amber-500 shadow-lg">
                          <AvatarImage
                            src={top1.user.profile_image_url || undefined}
                          />
                          <AvatarFallback className="bg-amber-50 text-amber-700 font-bold text-xl">
                            {top1.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                          1
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-foreground mt-4 line-clamp-1">
                        {top1.user.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        @{top1.user.username}
                      </p>
                      <div className="mt-2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
                        <Zap className="h-4 w-4 text-white fill-white" />
                        {top1.reward_points} pts
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                        {top1.copies} copies
                      </p>
                    </div>
                  )}
                </div>

                {/* 3rd Place */}
                <div className="order-3 flex flex-col items-center">
                  {top3 && (
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="relative mb-2">
                        <Award className="h-7 w-7 text-amber-700 absolute -top-4 -right-1 drop-shadow" />
                        <Avatar className="h-20 w-20 border-4 border-amber-700 shadow-md">
                          <AvatarImage
                            src={top3.user.profile_image_url || undefined}
                          />
                          <AvatarFallback className="bg-amber-50/50 text-amber-900 font-bold text-lg">
                            {top3.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-50 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                          3
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mt-2 line-clamp-1">
                        {top3.user.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        @{top3.user.username}
                      </p>
                      <div className="mt-2 bg-amber-50/40 dark:bg-amber-950/20 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1 border border-amber-200/50">
                        <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {top3.reward_points} pts
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {top3.copies} copies
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboard Table List */}
              {remainingLeaderboard.length > 0 && (
                <Card className="max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-sm mt-8">
                  <div className="divide-y">
                    {remainingLeaderboard.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                            {item.rank}
                          </span>
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={item.user.profile_image_url || undefined}
                            />
                            <AvatarFallback className="font-semibold bg-muted text-muted-foreground">
                              {item.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{item.user.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {item.copies} copies
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Shared Meals
                            </p>
                          </div>
                          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5 text-center min-w-[70px]">
                            <p className="text-xs font-bold text-primary flex items-center justify-center gap-0.5">
                              <Zap className="h-3 w-3 fill-primary" />
                              {item.reward_points}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-16 text-center">
              <p className="text-muted-foreground">
                {t('noLeaderboard')}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

