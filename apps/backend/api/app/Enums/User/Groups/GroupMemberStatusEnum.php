<?php

namespace App\Enums\User\Groups;

enum GroupMemberStatusEnum: string
{
    case ACTIVE = 'active';
    case LEFT = 'left';
    case REMOVED = 'removed';
}
