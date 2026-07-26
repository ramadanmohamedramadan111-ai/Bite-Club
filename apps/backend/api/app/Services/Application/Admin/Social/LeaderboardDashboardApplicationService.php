<?php

namespace App\Services\Application\Admin\Social;

use App\Services\Domain\Admin\Social\LeaderboardDashboardDomainService;

class LeaderboardDashboardApplicationService
{
    public function __construct(
        private readonly LeaderboardDashboardDomainService $leaderboardDashboardDomainService
    ) {}

    public function getDashboardStats(): array
    {
        return $this->leaderboardDashboardDomainService->getDashboardStats();
    }
}
