<?php

namespace App\Services\Application\Social;

use App\Services\Domain\Social\LeaderboardDomainService;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LeaderboardApplicationService
{
    public function __construct(
        private readonly LeaderboardDomainService $leaderboardDomainService
    ) {}

    public function generateWeeklyLeaderboard(?Carbon $periodStart = null, ?Carbon $periodEnd = null): array
    {
        return $this->leaderboardDomainService->generateWeeklyLeaderboard($periodStart, $periodEnd);
    }

    public function getLeaderboard(string $type = 'weekly', int $perPage = 10): LengthAwarePaginator
    {
        return $this->leaderboardDomainService->getLeaderboard($type, $perPage);
    }
}
