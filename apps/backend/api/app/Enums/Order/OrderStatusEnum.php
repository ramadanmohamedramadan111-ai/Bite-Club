<?php

namespace App\Enums\Order;

enum OrderStatusEnum: string
{
    case PENDING          = 'pending';
    case PREPARING        = 'preparing';
    case READY            = 'ready';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case COMPLETED        = 'completed';
    case CANCELLED        = 'cancelled';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
