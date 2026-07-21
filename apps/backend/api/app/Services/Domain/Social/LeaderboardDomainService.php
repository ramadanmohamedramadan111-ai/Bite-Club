<?php

namespace App\Services\Domain\Social;

use App\Models\Leaderboard;
use App\Models\OrderCopy;
use App\Enums\Social\PostStatusEnum;
use App\Enums\Social\OrderCopyStatusEnum;
use App\Enums\Social\LeaderboardTypeEnum;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LeaderboardDomainService
{
    public function generateWeeklyLeaderboard(?Carbon $periodStart = null, ?Carbon $periodEnd = null): array
    {
        $periodStart = $periodStart ?? now()->startOfWeek(Carbon::TUESDAY);
        $periodEnd   = $periodEnd ?? $periodStart->copy()->endOfWeek(Carbon::MONDAY);

        $stats = OrderCopy::query()
            ->join('posts', 'order_copies.post_id', '=', 'posts.id')
            ->where('posts.status', PostStatusEnum::APPROVED->value)
            ->where('order_copies.status', OrderCopyStatusEnum::COMPLETED->value)
            ->whereBetween('order_copies.completed_at', [$periodStart, $periodEnd])
            ->select('posts.user_id', DB::raw('COUNT(order_copies.id) as total_copies'))
            ->groupBy('posts.user_id')
            ->orderBy('total_copies', 'desc')
            ->take(3)
            ->get();

        return DB::transaction(function () use ($stats, $periodStart, $periodEnd) {
            Leaderboard::where('type', LeaderboardTypeEnum::WEEKLY->value)
                ->where('period_start', $periodStart)
                ->delete();

            $created = [];
            $rank = 1;

            foreach ($stats as $stat) {
                $points = match ($rank) {
                    1 => 500,
                    2 => 300,
                    3 => 200,
                    default => 0,
                };

                $record = Leaderboard::create([
                    'type'          => LeaderboardTypeEnum::WEEKLY->value,
                    'period_start'  => $periodStart,
                    'period_end'    => $periodEnd,
                    'rank'          => $rank,
                    'user_id'       => $stat->user_id,
                    'copies'        => (int) $stat->total_copies,
                    'reward_points' => $points,
                ]);

                $created[] = $record->load('user');
                $rank++;
            }

            return $created;
        });
    }

    public function getLeaderboard(string $type = 'weekly', int $perPage = 10): LengthAwarePaginator
    {
        return Leaderboard::with('user')
            ->where('type', $type)
            ->where('rank', '<=', 3)
            ->orderBy('rank', 'asc')
            ->paginate($perPage);
    }
}
