<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'user_id' => User::factory(),
            'order_type' => $this->faker->randomElement(OrderTypeEnum::values()),
            'status' => OrderStatusEnum::PENDING->value,
            'subtotal' => 100.00,
            'delivery_fee' => 10.00,
            'service_fee' => 5.00,
            'total' => 115.00,
        ];
    }
}
