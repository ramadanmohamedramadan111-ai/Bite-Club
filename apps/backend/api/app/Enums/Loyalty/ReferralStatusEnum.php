<?php

namespace App\Enums\Loyalty;

enum ReferralStatusEnum: string
{
    case PENDING   = 'pending';
    case COMPLETED = 'completed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
