<?php

namespace Tests\Feature\Restaurant;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class LiveOrdersTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->restaurant = Restaurant::factory()->create();
        $this->token = JWTAuth::fromUser($this->restaurant);
    }

    public function test_it_returns_live_orders_in_correct_order_and_filters_out_awaiting_payment()
    {
        $user = User::factory()->create();

        // Should NOT be visible (Awaiting Payment)
        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::AWAITING_PAYMENT->value,
            'created_at' => now()->subMinutes(10),
        ]);

        // Should be visible (Pending - Oldest, highest priority)
        $orderPendingOld = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now()->subMinutes(20),
        ]);

        // Should be visible (Pending - Newer)
        $orderPendingNew = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now()->subMinutes(5),
        ]);

        // Should be visible (Preparing)
        $orderPreparing = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::PREPARING->value,
            'created_at' => now()->subMinutes(30),
        ]);

        // Should be visible (Completed Today)
        $orderCompletedToday = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::COMPLETED->value,
            'created_at' => now(),
        ]);

        // Should NOT be visible (Completed Yesterday)
        Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $user->id,
            'status' => OrderStatusEnum::COMPLETED->value,
            'created_at' => Carbon::yesterday(),
            'updated_at' => Carbon::yesterday(),
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/restaurant/orders/live');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $data = $response->json('data');

        // We expect exactly 4 orders: pending(2), preparing(1), completed_today(1)
        $this->assertCount(4, $data);

        // Verify sorting:
        // Priority 1: Pending (Oldest first)
        $this->assertEquals($orderPendingOld->id, $data[0]['id']);
        $this->assertEquals($orderPendingNew->id, $data[1]['id']);
        
        // Priority 2: Preparing
        $this->assertEquals($orderPreparing->id, $data[2]['id']);
        
        // Priority 3: Completed Today
        $this->assertEquals($orderCompletedToday->id, $data[3]['id']);
    }

    public function test_it_returns_unauthorized_if_no_token_provided()
    {
        $response = $this->getJson('/api/restaurant/orders/live');

        $response->assertStatus(401);
    }
}
