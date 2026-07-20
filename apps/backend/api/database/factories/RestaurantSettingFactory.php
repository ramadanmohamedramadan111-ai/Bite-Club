<?php

namespace Database\Factories;

use App\Models\RestaurantSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantSettingFactory extends Factory
{
    protected $model = RestaurantSetting::class;

    public function definition(): array
    {
        return [
            'is_open'             => $this->faker->boolean(80),
            'accept_orders'       => $this->faker->boolean(90),
            'delivery_enabled'    => $this->faker->boolean(90),
            'pickup_enabled'      => $this->faker->boolean(),
            'latitude'            => $this->faker->latitude(30.0000, 30.1500),
            'longitude'           => $this->faker->longitude(31.2000, 31.4000),
            'delivery_radius'     => $this->faker->randomFloat(2, 5, 20),
            'delivery_fee_per_km' => $this->faker->randomFloat(2, 2, 10),
            'deposit_threshold'   => $this->faker->randomFloat(2, 100, 500),
            'deposit_percentage'  => $this->faker->randomFloat(2, 10, 50),
            'min_price_order'     => 25.00,
        ];
    }
}
