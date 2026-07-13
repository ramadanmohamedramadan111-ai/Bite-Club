<?php

namespace Tests\Feature\RestaurantAuth;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

abstract class RestaurantAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function createRestaurant(array $attributes = []): Restaurant
    {
        return Restaurant::query()->create(array_merge([
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => Hash::make('password123'),
            'phone_number' => fake()->unique()->numerify('01#########'),
            'address' => fake()->address(),
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ], $attributes));
    }

    /**
     * @return array{0: Restaurant, 1: string}
     */
    protected function loginRestaurant(array $attributes = []): array
    {
        $restaurant = $this->createRestaurant($attributes);

        $response = $this->postJson('/api/restaurant/login', [
            'email' => $restaurant->email,
            'password' => 'password123',
        ]);

        $response->assertOk();

        return [$restaurant->fresh(), $response->json('data.access_token')];
    }
}
