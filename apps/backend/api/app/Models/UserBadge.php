<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Loyalty\BadgeTypeEnum;

class UserBadge extends Model
{
    protected $fillable = [
        'user_id',
        'badge_type',
        'week_start_date',
    ];

    protected $casts = [
        'badge_type'      => BadgeTypeEnum::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
