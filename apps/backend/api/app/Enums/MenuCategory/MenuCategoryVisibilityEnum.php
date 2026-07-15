<?php

namespace App\Enums\MenuCategory;

enum MenuCategoryVisibilityEnum: string
{
    case VISIBLE = 'visible';
    case HIDDEN = 'hidden';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
