<?php

namespace App\Enums\GroupOrder;

enum GroupOrderStatusEnum: string
{
    case OPEN = 'open';
    case LOCKED = 'locked';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
}
