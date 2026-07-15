<?php

namespace App\Enums\MenuItem;

enum MenuItemAvailabilityEnum: string
{
    case AVAILABLE = 'available';
    case UNAVAILABLE = 'unavailable';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
