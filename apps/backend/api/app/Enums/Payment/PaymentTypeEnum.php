<?php

namespace App\Enums\Payment;

enum PaymentTypeEnum: string
{
    case FULL = 'full';
    case DEPOSIT = 'deposit';
    case REMAINING = 'remaining';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
