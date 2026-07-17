<?php

namespace App\Enums\User\Groups;

enum GroupStatusEnum: string
{
    case ACTIVE = 'active';
    case ARCHIVED = 'archived';
}
