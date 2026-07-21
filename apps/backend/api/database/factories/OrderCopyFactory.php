<?php

namespace Database\Factories;

use App\Models\OrderCopy;
use App\Models\Post;
use App\Models\Order;
use App\Models\User;
use App\Enums\Social\OrderCopyStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderCopyFactory extends Factory
{
    protected $model = OrderCopy::class;

    public function definition(): array
    {
        return [
            'post_id'           => Post::factory(),
            'original_order_id' => Order::factory(),
            'copied_order_id'   => Order::factory(),
            'copied_by_user_id' => User::factory(),
            'status'            => OrderCopyStatusEnum::PENDING->value,
            'completed_at'      => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'       => OrderCopyStatusEnum::COMPLETED->value,
            'completed_at' => now(),
        ]);
    }
}
