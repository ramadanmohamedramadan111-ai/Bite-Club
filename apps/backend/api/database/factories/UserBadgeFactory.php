<?php

namespace Database\Factories;

use App\Models\UserBadge;
use App\Models\User;
use App\Enums\Loyalty\BadgeTypeEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserBadgeFactory extends Factory
{
    protected $model = UserBadge::class;

    public function definition(): array
    {
        return [
            'user_id'         => User::factory(),
            'badge_type'      => fake()->randomElement(BadgeTypeEnum::cases())->value,
            'week_start_date' => now()->startOfWeek(Carbon::TUESDAY)->toDateString(),
        ];
    }
}
