<?php

namespace App\Enums\Loyalty;

enum PointTransactionSourceEnum: string
{
    case REFERRAL      = 'referral';
    case WEEKLY_STREAK = 'weekly_streak';
    case LEADERBOARD   = 'leaderboard';
    case REDEMPTION    = 'redemption';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
