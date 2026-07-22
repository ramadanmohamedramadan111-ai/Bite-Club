<?php

namespace Tests\Feature\User;

use App\Enums\Order\OrderStatusEnum;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class PastOrdersTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Restaurant $restaurant;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->restaurant = Restaurant::factory()->create();
        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_it_returns_unauthorized_if_no_token()
    {
        $response = $this->getJson('/api/user/orders/past');
        $response->assertStatus(401);
    }

    public function test_it_returns_only_past_orders_for_user_paginated()
    {
        // Completed order (should be returned)
        Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::COMPLETED->value,
        ]);

        // Cancelled order (should be returned)
        Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        // Active order (should not be returned)
        Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        // Other user's past order (should not be returned)
        $otherUser = User::factory()->create();
        Order::factory()->create([
            'user_id' => $otherUser->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::COMPLETED->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/orders/past');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        // Assert pagination meta exists
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'items' => [
                    '*' => ['id', 'status', 'order_type', 'restaurant']
                ],
                'meta' => ['current_page', 'last_page', 'total']
            ]
        ]);

        $this->assertEquals(2, $response->json('data.meta.total'));
        
        $statuses = collect($response->json('data.items'))->pluck('status')->toArray();
        $this->assertContains(OrderStatusEnum::COMPLETED->value, $statuses);
        $this->assertContains(OrderStatusEnum::CANCELLED->value, $statuses);
        $this->assertNotContains(OrderStatusEnum::PREPARING->value, $statuses);
    }
}
