<?php

namespace App\Enums\Auth;

enum UserStatusEnum: string
{
    case ACTIVE = 'active';
    case PENDING = 'pending';
    case SUSPENDED = 'suspended';
    case BANNED = 'banned';
    case DELETED = 'deleted';

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }
}