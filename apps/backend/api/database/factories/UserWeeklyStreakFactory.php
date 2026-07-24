<?php

namespace Database\Factories;

use App\Models\UserWeeklyStreak;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserWeeklyStreakFactory extends Factory
{
    protected $model = UserWeeklyStreak::class;

    public function definition(): array
    {
        return [
            'user_id'                => User::factory(),
            'completed_orders_count' => fake()->numberBetween(0, 10),
            'week_start_date'        => now()->startOfWeek(Carbon::TUESDAY)->toDateString(),
            'reward_granted'         => false,
        ];
    }
}
