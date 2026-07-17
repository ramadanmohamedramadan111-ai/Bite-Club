<?php

namespace Database\Factories;

use App\Models\RestaurantReview;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantReviewFactory extends Factory
{
    protected $model = RestaurantReview::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'user_id'       => User::factory(),
            'rating'        => $this->faker->numberBetween(1, 5),
            'comment'       => $this->faker->sentence(),
        ];
    }
}
