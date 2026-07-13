<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'phone_number' => fake()->unique()->numerify('01#########'),
            'username' => fake()->unique()->userName(),

            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),

            'date_of_birth' => fake()->date(),
            'email' => fake()->unique()->safeEmail(),

            'password_hash' => Hash::make('password123'),

            'firebase_uid' => null,

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
