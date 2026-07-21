<?php

namespace Tests\Feature\User;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class OrderDetailsTest extends TestCase
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
        $response = $this->getJson('/api/user/orders/1');
        $response->assertStatus(401);
    }

    public function test_it_returns_404_if_order_not_found()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/orders/999');

        $response->assertStatus(404);
    }

    public function test_it_returns_404_if_order_belongs_to_another_user()
    {
        $otherUser = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $otherUser->id,
            'restaurant_id' => $this->restaurant->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/user/orders/{$order->id}");

        $response->assertStatus(404);
    }

    public function test_it_returns_order_details_with_tracking_for_delivery()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'order_type' => OrderTypeEnum::DELIVERY->value,
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/user/orders/{$order->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $data = $response->json('data');
        
        $this->assertEquals($order->id, $data['id']);
        $this->assertArrayHasKey('tracking', $data);
        
        $tracking = $data['tracking'];
        $this->assertFalse($tracking['is_cancelled']);
        $this->assertEquals(2, $tracking['current_step']); // PENDING is 1, PREPARING is 2
        $this->assertEquals(5, $tracking['total_steps']); // Delivery has 5 steps
        
        // Check steps states
        $this->assertEquals('completed', $tracking['steps'][0]['state']); // Pending
        $this->assertEquals('active', $tracking['steps'][1]['state']); // Preparing
        $this->assertEquals('pending', $tracking['steps'][2]['state']); // Ready
    }

    public function test_it_returns_cancelled_tracking()
    {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'order_type' => OrderTypeEnum::DELIVERY->value,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/user/orders/{$order->id}");

        $response->assertStatus(200);

        $tracking = $response->json('data.tracking');
        $this->assertTrue($tracking['is_cancelled']);
        $this->assertEmpty($tracking['steps']);
    }
}
