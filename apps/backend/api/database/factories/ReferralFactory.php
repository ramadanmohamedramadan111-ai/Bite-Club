<?php

namespace Database\Factories;

use App\Models\Referral;
use App\Models\User;
use App\Enums\Loyalty\ReferralStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReferralFactory extends Factory
{
    protected $model = Referral::class;

    public function definition(): array
    {
        $status = fake()->randomElement(ReferralStatusEnum::cases());

        return [
            'referrer_id'  => User::factory(),
            'referred_id'  => User::factory(),
            'status'       => $status->value,
            'completed_at' => $status === ReferralStatusEnum::COMPLETED ? now() : null,
        ];
    }
}
