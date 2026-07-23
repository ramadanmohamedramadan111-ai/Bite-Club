<?php

namespace App\Services\Domain\Loyalty;

use App\Models\Leaderboard;
use App\Enums\Loyalty\PointTransactionSourceEnum;

class LeaderboardRewardDomainService
{
    public function __construct(
        private readonly WalletDomainService $walletService
    ) {}

    public function rewardWinner(Leaderboard $leaderboard): void
    {
        if ($leaderboard->reward_points > 0) {
            $this->walletService->earnPoints(
                $leaderboard->user_id,
                $leaderboard->reward_points,
                PointTransactionSourceEnum::LEADERBOARD->value,
                $leaderboard->id,
                Leaderboard::class
            );
        }
    }
}
