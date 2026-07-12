<?php

namespace App\Enums\Restaurant;

enum RestaurantStatusEnum: string
{
    case PENDING_APPROVAL = 'pending_approval';
    case ACTIVE           = 'active';
    case SUSPENDED        = 'suspended';
    case CLOSED           = 'closed';
    case REJECTED         = 'rejected';

    public function isPendingApproval(): bool
    {
        return $this === self::PENDING_APPROVAL;
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function canLogin(): bool
    {
        return $this === self::ACTIVE;
    }
}
