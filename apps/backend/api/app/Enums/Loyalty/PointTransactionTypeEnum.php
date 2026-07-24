<?php

namespace App\Enums\Loyalty;

enum PointTransactionTypeEnum: string
{
    case EARN   = 'earn';
    case REDEEM = 'redeem';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
