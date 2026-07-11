<?php

namespace Database\Factories;

use App\Enums\Auth\AdminStatusEnum;
use App\Models\Admin;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Admin>
 */
class AdminFactory extends Factory
{
    protected $model = Admin::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => Hash::make('password123'),
            'status' => AdminStatusEnum::ACTIVE->value,
            'last_login_at' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'status' => AdminStatusEnum::INACTIVE->value,
        ]);
    }

    public function withPassword(string $password): static
    {
        return $this->state(fn () => [
            'password_hash' => Hash::make($password),
        ]);
    }
}
