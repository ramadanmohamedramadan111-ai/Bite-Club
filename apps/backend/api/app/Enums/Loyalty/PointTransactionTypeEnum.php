<?php

namespace App\Enums\Loyalty;

enum PointTransactionTypeEnum: string
{
    case EARN   = 'earn';
    case REDEEM = 'redeem';
    case GIFT_SENT = 'gift_sent';
    case GIFT_RECEIVED = 'gift_received';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
