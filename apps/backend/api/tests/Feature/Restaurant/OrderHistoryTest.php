<?php

namespace Tests\Feature\Restaurant;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class OrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->restaurant = Restaurant::factory()->create();
        $this->user = User::factory()->create();
        $this->token = JWTAuth::fromUser($this->restaurant);
    }

    public function test_it_returns_unauthorized_if_no_token_provided()
    {
        $response = $this->getJson('/api/restaurant/orders/history');
        $response->assertStatus(401);
    }

    public function test_it_returns_paginated_history_with_default_settings()
    {
        // Create 20 orders
        Order::factory()->count(20)->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::COMPLETED->value,
            'order_type' => OrderTypeEnum::DELIVERY->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/orders/history');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        // Assert pagination meta exists
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => ['id', 'status', 'order_type'] // LiveOrderResource structure
            ],
            'links',
            'meta' => ['current_page', 'last_page', 'per_page', 'total']
        ]);

        // Default per_page is 15
        $this->assertEquals(15, count($response->json('data')));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_it_filters_history_by_status_and_type()
    {
        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::COMPLETED->value,
            'order_type' => OrderTypeEnum::DELIVERY->value,
        ]);

        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::CANCELLED->value,
            'order_type' => OrderTypeEnum::PICKUP->value,
        ]);

        // Filter by COMPLETED
        $response1 = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/orders/history?status=' . OrderStatusEnum::COMPLETED->value);

        $response1->assertStatus(200);
        $this->assertEquals(1, $response1->json('meta.total'));
        $this->assertEquals(OrderStatusEnum::COMPLETED->value, $response1->json('data.0.status'));

        // Filter by PICKUP
        $response2 = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/orders/history?order_type=' . OrderTypeEnum::PICKUP->value);

        $response2->assertStatus(200);
        $this->assertEquals(1, $response2->json('meta.total'));
        $this->assertEquals(OrderTypeEnum::PICKUP->value, $response2->json('data.0.order_type'));
    }
}
