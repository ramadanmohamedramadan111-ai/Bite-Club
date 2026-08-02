'use client';

import type { LeaderBoardItem } from '@/types/posts';
import { Award, Crown, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { getMediaUrl } from '@/lib/utils';

export default function LeaderboardFeed({
  items,
}: {
  items: LeaderBoardItem[];
}) {
  const t = useTranslations('feed');

  const top1 = items.find((item) => item.rank === 1);
  const top2 = items.find((item) => item.rank === 2);
  const top3 = items.find((item) => item.rank === 3);
  const remaining = items.filter((item) => item.rank > 3);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-16 text-center">
        <p className="text-muted-foreground">{t('noLeaderboard')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-8 max-w-3xl mx-auto">
        {/* 2nd Place */}
        <div className="order-2 sm:order-1 flex flex-col items-center">
          {top2 && (
            <div className="flex flex-col items-center text-center w-full">
              <div className="relative mb-2">
                <Award className="h-7 w-7 text-slate-300 absolute -top-4 -right-1 drop-shadow" />
                <Avatar className="h-20 w-20 border-4 border-slate-300 shadow-md">
                  <AvatarImage src={getMediaUrl(top2.user.profile_image_url)} />
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
                  <AvatarImage src={getMediaUrl(top1.user.profile_image_url)} />
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
                  <AvatarImage src={getMediaUrl(top3.user.profile_image_url)} />
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

      {remaining.length > 0 && (
        <Card className="max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-sm mt-8">
          <div className="divide-y">
            {remaining.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                    {item.rank}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={getMediaUrl(item.user.profile_image_url)}
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
  );
}

