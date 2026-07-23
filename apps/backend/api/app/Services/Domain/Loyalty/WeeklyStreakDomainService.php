<?php

namespace App\Services\Domain\Loyalty;

use App\Models\Order;
use App\Models\UserWeeklyStreak;
use App\Models\UserBadge;
use App\Enums\Loyalty\PointTransactionSourceEnum;
use App\Enums\Loyalty\BadgeTypeEnum;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class WeeklyStreakDomainService
{
    public function __construct(
        private readonly WalletDomainService $walletService
    ) {}

    public function handleCompletedOrder(Order $order): void
    {
        // Eligibility: Order total must be >= 50 EGP
        if ($order->total < 50.00) {
            return;
        }

        $weekStart = now()->startOfWeek(Carbon::TUESDAY)->toDateString();

        DB::transaction(function () use ($order, $weekStart) {
            $streak = UserWeeklyStreak::firstOrCreate([
                'user_id'         => $order->user_id,
                'week_start_date' => $weekStart,
            ], [
                'completed_orders_count' => 0,
                'reward_granted'         => false,
            ]);

            // Lock row to prevent race conditions
            $lockedStreak = UserWeeklyStreak::where('id', $streak->id)->lockForUpdate()->first();
            $lockedStreak->increment('completed_orders_count');
        });
    }

    public function grantWeeklyRewards(): void
    {
        $currentWeekStart = now()->startOfWeek(Carbon::TUESDAY)->toDateString();

        // Get all pending streaks from past weeks
        $pendingStreaks = UserWeeklyStreak::where('reward_granted', false)
            ->where('week_start_date', '<', $currentWeekStart)
            ->get();

        foreach ($pendingStreaks as $streak) {
            $points = 0;
            $badgeType = null;

            if ($streak->completed_orders_count >= 5) {
                $points = 150;
                $badgeType = BadgeTypeEnum::WEEKLY_5_ORDERS->value;
            } elseif ($streak->completed_orders_count >= 3) {
                $points = 100;
                $badgeType = BadgeTypeEnum::WEEKLY_3_ORDERS->value;
            }

            DB::transaction(function () use ($streak, $points, $badgeType) {
                // Lock row
                $lockedStreak = UserWeeklyStreak::where('id', $streak->id)->lockForUpdate()->first();
                
                if ($lockedStreak->reward_granted) {
                    return;
                }

                if ($points > 0) {
                    $this->walletService->earnPoints(
                        $lockedStreak->user_id,
                        $points,
                        PointTransactionSourceEnum::WEEKLY_STREAK->value,
                        $lockedStreak->id,
                        UserWeeklyStreak::class
                    );
                }

                if ($badgeType) {
                    UserBadge::firstOrCreate([
                        'user_id'         => $lockedStreak->user_id,
                        'badge_type'      => $badgeType,
                        'week_start_date' => $lockedStreak->week_start_date,
                    ]);
                }

                $lockedStreak->update(['reward_granted' => true]);
            });
        }
    }

    public function getUserStreakProgress(int $userId): array
    {
        $currentWeekStart = now()->startOfWeek(Carbon::TUESDAY)->toDateString();

        $streak = UserWeeklyStreak::firstOrCreate([
            'user_id'         => $userId,
            'week_start_date' => $currentWeekStart,
        ], [
            'completed_orders_count' => 0,
            'reward_granted'         => false,
        ]);

        $count = $streak->completed_orders_count;

        $nextTier = null;
        if ($count < 3) {
            $nextTier = [
                'target_orders' => 3,
                'orders_needed' => 3 - $count,
                'reward_points' => 100,
                'badge_type'    => BadgeTypeEnum::WEEKLY_3_ORDERS->value,
            ];
        } elseif ($count < 5) {
            $nextTier = [
                'target_orders' => 5,
                'orders_needed' => 5 - $count,
                'reward_points' => 150,
                'badge_type'    => BadgeTypeEnum::WEEKLY_5_ORDERS->value,
            ];
        }

        $badges = UserBadge::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($badge) {
                return [
                    'id'              => $badge->id,
                    'badge_type'      => $badge->badge_type->value ?? $badge->badge_type,
                    'week_start_date' => $badge->week_start_date,
                    'created_at'      => $badge->created_at?->toIso8601String(),
                ];
            });

        return [
            'week_start_date'        => $currentWeekStart,
            'completed_orders_count' => $count,
            'next_tier'              => $nextTier,
            'badges'                 => $badges,
        ];
    }
}
