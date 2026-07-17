<?php

namespace App\Enums\User\Groups;

enum GroupMemberRoleEnum: string
{
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MEMBER = 'member';
}
