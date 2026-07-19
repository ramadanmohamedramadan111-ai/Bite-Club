<?php

namespace App\Enums\Order;

enum OrderTypeEnum: string
{
    case DELIVERY = 'delivery';
    case PICKUP   = 'pickup';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
