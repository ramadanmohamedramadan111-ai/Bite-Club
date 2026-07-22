<?php

namespace Tests\Feature\User;

use App\Enums\Order\OrderStatusEnum;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ActiveOrdersTest extends TestCase
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
        $response = $this->getJson('/api/user/orders/active');
        $response->assertStatus(401);
    }

    public function test_it_returns_only_active_orders_for_user()
    {
        // Active order
        Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        // Another active order
        Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::OUT_FOR_DELIVERY->value,
        ]);

        // Completed order (should not be returned)
        Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::COMPLETED->value,
        ]);

        // Cancelled order (should not be returned)
        Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        // Other user's active order (should not be returned)
        $otherUser = User::factory()->create();
        Order::factory()->create([
            'user_id' => $otherUser->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/orders/active');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $data = $response->json('data');
        
        // Should only have the 2 active orders
        $this->assertCount(2, $data);
        
        $statuses = collect($data)->pluck('status')->toArray();
        $this->assertContains(OrderStatusEnum::PREPARING->value, $statuses);
        $this->assertContains(OrderStatusEnum::OUT_FOR_DELIVERY->value, $statuses);
        $this->assertNotContains(OrderStatusEnum::COMPLETED->value, $statuses);
        $this->assertNotContains(OrderStatusEnum::CANCELLED->value, $statuses);
    }
}
