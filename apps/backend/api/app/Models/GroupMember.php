<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\User\Groups\GroupMemberRoleEnum;
use App\Enums\User\Groups\GroupMemberStatusEnum;

class GroupMember extends Model
{
    use HasFactory;

    protected $table = 'group_members';

    protected $fillable = [
        'group_id',
        'user_id',
        'role',
        'status',
        'joined_at',
        'left_at',
    ];

    protected function casts(): array
    {
        return [
            'group_id'  => 'integer',
            'user_id'   => 'integer',
            'role'      => GroupMemberRoleEnum::class,
            'status'    => GroupMemberStatusEnum::class,
            'joined_at' => 'datetime',
            'left_at'   => 'datetime',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
