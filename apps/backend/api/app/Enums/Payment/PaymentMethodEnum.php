<?php

namespace App\Enums\Payment;

enum PaymentMethodEnum: string
{
    case CASH = 'cash';
    case ONLINE = 'online';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
