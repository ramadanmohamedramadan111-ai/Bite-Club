<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserWeeklyStreak extends Model
{
    protected $fillable = [
        'user_id',
        'completed_orders_count',
        'week_start_date',
        'reward_granted',
    ];

    protected $casts = [
        'completed_orders_count' => 'integer',
        'reward_granted'         => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
