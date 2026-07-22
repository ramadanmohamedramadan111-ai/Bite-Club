<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reason',
        'banned_by_admin_id',
        'banned_at',
        'lifted_by_admin_id',
        'lifted_reason',
        'lifted_at',
    ];

    protected function casts(): array
    {
        return [
            'user_id'             => 'integer',
            'banned_by_admin_id'  => 'integer',
            'lifted_by_admin_id'  => 'integer',
            'banned_at'           => 'datetime',
            'lifted_at'           => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bannedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'banned_by_admin_id');
    }

    public function liftedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'lifted_by_admin_id');
    }
}
