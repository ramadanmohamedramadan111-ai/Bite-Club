<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Restaurant>
 */
class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->safeEmail(),
            'password_hash' => Hash::make('password123'),
            'phone_number' => $this->faker->unique()->numerify('01#########'),
            'category_id' => RestaurantCategory::factory(),
            'description' => $this->faker->sentence(),
            'address' => $this->faker->address(),
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ];
    }
}
