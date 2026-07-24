<?php

namespace App\Enums\Loyalty;

enum BadgeTypeEnum: string
{
    case WEEKLY_3_ORDERS = 'weekly_3_orders';
    case WEEKLY_5_ORDERS = 'weekly_5_orders';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
