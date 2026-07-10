<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'phone_number' => fake()->unique()->numerify('01#########'),
            'username' => fake()->unique()->userName(),
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'profile_image_url' => fake()->imageUrl(),
            'gender' => fake()->randomElement(['male', 'female']),
            'referral_code' => fake()->unique()->bothify('REF-#####'),
            'referred_by' => null,
            'failed_pickup_count' => 0,
            'status' => 'active',
            'last_login_at' => now(),
        ];
    }
}
