<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\Restaurant;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Order\OrderStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id'       => User::factory(),
            'restaurant_id' => Restaurant::factory(),
            'order_type'    => OrderTypeEnum::DELIVERY->value,
            'status'        => OrderStatusEnum::COMPLETED->value,
            'subtotal'      => 50.00,
            'delivery_fee'  => 5.00,
            'service_fee'   => 2.00,
            'total'         => 57.00,
        ];
    }
}
