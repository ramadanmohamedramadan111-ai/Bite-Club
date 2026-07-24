<?php

namespace App\Services\Domain\Loyalty;

use App\Models\Order;
use App\Models\UserWeeklyStreak;
use App\Models\UserBadge;
use App\Enums\Order\OrderStatusEnum;
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
        $weekStart = now()->startOfWeek(Carbon::TUESDAY)->toDateString();
        $this->syncStreakOrderCount($order->user_id, $weekStart);
    }

    public function syncStreakOrderCount(int $userId, string $weekStartDate): int
    {
        $weekStart = Carbon::parse($weekStartDate)->startOfDay();
        $weekEnd = (clone $weekStart)->addDays(6)->endOfDay();

        // Count completed orders >= 50 EGP created or updated within the week window
        $actualCount = Order::where('user_id', $userId)
            ->where('status', OrderStatusEnum::COMPLETED->value)
            ->where('total', '>=', 50.00)
            ->where(function ($q) use ($weekStart, $weekEnd) {
                $q->whereBetween('created_at', [$weekStart, $weekEnd])
                  ->orWhereBetween('updated_at', [$weekStart, $weekEnd]);
            })
            ->count();

        $streak = UserWeeklyStreak::firstOrCreate([
            'user_id'         => $userId,
            'week_start_date' => $weekStartDate,
        ], [
            'completed_orders_count' => 0,
            'reward_granted'         => false,
        ]);

        if ($actualCount > $streak->completed_orders_count) {
            $streak->update(['completed_orders_count' => $actualCount]);
        }

        return max($streak->completed_orders_count, $actualCount);
    }

    public function grantWeeklyRewards(): void
    {
        $currentWeekStart = now()->startOfWeek(Carbon::TUESDAY)->toDateString();

        // Get all pending streaks from past weeks
        $pendingStreaks = UserWeeklyStreak::where('reward_granted', false)
            ->where('week_start_date', '<', $currentWeekStart)
            ->get();

        foreach ($pendingStreaks as $streak) {
            // Sync count from orders table before evaluating rewards
            $completedCount = $this->syncStreakOrderCount($streak->user_id, $streak->week_start_date);

            $points = 0;
            $badgeType = null;

            if ($completedCount >= 5) {
                $points = 150;
                $badgeType = BadgeTypeEnum::WEEKLY_5_ORDERS->value;
            } elseif ($completedCount >= 3) {
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

        $count = $this->syncStreakOrderCount($userId, $currentWeekStart);

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
