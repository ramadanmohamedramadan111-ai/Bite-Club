<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Order;
use App\Enums\Social\PostStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'user_id'          => User::factory(),
            'restaurant_id'    => Restaurant::factory(),
            'order_id'         => Order::factory(),
            'caption'          => $this->faker->sentence(),
            'status'           => PostStatusEnum::PENDING->value,
            'reviewed_by'      => null,
            'reviewed_at'      => null,
            'rejection_reason' => null,
            'likes_count'      => 0,
            'copy_count'       => 0,
            'published_at'     => null,
            'expires_at'       => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'       => PostStatusEnum::APPROVED->value,
            'published_at' => now(),
            'expires_at'   => now()->addDays(7),
            'reviewed_at'  => now(),
        ]);
    }

    public function rejected(?string $reason = 'Inappropriate content'): static
    {
        return $this->state(fn (array $attributes) => [
            'status'           => PostStatusEnum::REJECTED->value,
            'reviewed_at'      => now(),
            'rejection_reason' => $reason,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'       => PostStatusEnum::APPROVED->value,
            'published_at' => now()->subDays(10),
            'expires_at'   => now()->subDays(3),
            'reviewed_at'  => now()->subDays(10),
        ]);
    }
}
