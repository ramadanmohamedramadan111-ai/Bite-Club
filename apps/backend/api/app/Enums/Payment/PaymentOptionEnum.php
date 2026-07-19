<?php

namespace App\Enums\Payment;

enum PaymentOptionEnum: string
{
    case SPLIT_PAYMENT = 'split_payment';
    case FULL_ONLINE = 'full_online';
    case FULL_CASH = 'full_cash';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
