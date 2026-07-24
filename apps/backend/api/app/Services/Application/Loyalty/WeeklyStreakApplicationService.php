<?php

namespace App\Services\Application\Loyalty;

use App\Services\Domain\Loyalty\WeeklyStreakDomainService;

class WeeklyStreakApplicationService
{
    public function __construct(
        private readonly WeeklyStreakDomainService $weeklyStreakDomainService
    ) {}

    public function grantWeeklyRewards(): void
    {
        $this->weeklyStreakDomainService->grantWeeklyRewards();
    }

    public function getStreakProgress(int $userId): array
    {
        return $this->weeklyStreakDomainService->getUserStreakProgress($userId);
    }
}
