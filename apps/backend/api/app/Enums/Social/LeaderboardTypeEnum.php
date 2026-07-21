<?php

namespace App\Enums\Social;

enum LeaderboardTypeEnum: string
{
    case WEEKLY  = 'weekly';
    case MONTHLY = 'monthly';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
