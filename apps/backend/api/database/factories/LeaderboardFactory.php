<?php

namespace Database\Factories;

use App\Models\Leaderboard;
use App\Models\User;
use App\Enums\Social\LeaderboardTypeEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeaderboardFactory extends Factory
{
    protected $model = Leaderboard::class;

    public function definition(): array
    {
        return [
            'type'          => LeaderboardTypeEnum::WEEKLY->value,
            'period_start'  => now()->startOfWeek(),
            'period_end'    => now()->endOfWeek(),
            'rank'          => 1,
            'user_id'       => User::factory(),
            'copies'        => 10,
            'reward_points' => 100,
        ];
    }
}
