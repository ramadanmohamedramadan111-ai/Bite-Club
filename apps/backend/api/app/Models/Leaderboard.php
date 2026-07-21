<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\Social\LeaderboardTypeEnum;

class Leaderboard extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'period_start',
        'period_end',
        'rank',
        'user_id',
        'copies',
        'reward_points',
    ];

    protected $casts = [
        'type'          => LeaderboardTypeEnum::class,
        'period_start'  => 'datetime',
        'period_end'    => 'datetime',
        'rank'          => 'integer',
        'copies'        => 'integer',
        'reward_points' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
