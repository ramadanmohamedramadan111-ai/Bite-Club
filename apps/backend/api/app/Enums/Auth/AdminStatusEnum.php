<?php

namespace App\Enums\Auth;

enum AdminStatusEnum: string
{
    case ACTIVE   = 'active';
    case INACTIVE = 'inactive';

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }
}
