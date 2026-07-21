<?php

namespace Tests\Feature\Restaurant;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AvailableOrderStatusTest extends TestCase
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
        $response = $this->getJson('/api/restaurant/orders/1/available-statuses');

        $response->assertStatus(401);
    }

    public function test_it_returns_not_found_if_order_belongs_to_another_restaurant()
    {
        $otherRestaurant = Restaurant::factory()->create();
        $order = Order::factory()->create([
            'restaurant_id' => $otherRestaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/restaurant/orders/{$order->id}/available-statuses");

        // Fails validation because order_id must exist where restaurant_id is this->restaurant->id
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['order_id']);
    }

    public function test_it_returns_preparing_and_cancelled_for_pending_cash_order()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        // Cash payment
        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::CASH->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/restaurant/orders/{$order->id}/available-statuses");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertContains(OrderStatusEnum::PREPARING->value, $data);
        $this->assertContains(OrderStatusEnum::CANCELLED->value, $data);
    }

    public function test_it_removes_cancelled_for_pending_online_order()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        // Online payment
        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::ONLINE->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/restaurant/orders/{$order->id}/available-statuses");

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertContains(OrderStatusEnum::PREPARING->value, $data);
        $this->assertNotContains(OrderStatusEnum::CANCELLED->value, $data);
    }

    public function test_it_filters_out_for_delivery_if_order_is_pickup()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::READY->value,
            'order_type' => OrderTypeEnum::PICKUP->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/restaurant/orders/{$order->id}/available-statuses");

        $response->assertStatus(200);

        $data = $response->json('data');
        // READY usually goes to OUT_FOR_DELIVERY or COMPLETED. 
        // For pickup, OUT_FOR_DELIVERY is removed.
        $this->assertCount(1, $data);
        $this->assertContains(OrderStatusEnum::COMPLETED->value, $data);
        $this->assertNotContains(OrderStatusEnum::OUT_FOR_DELIVERY->value, $data);
    }

    public function test_it_allows_out_for_delivery_if_order_is_delivery()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::READY->value,
            'order_type' => OrderTypeEnum::DELIVERY->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson("/api/restaurant/orders/{$order->id}/available-statuses");

        $response->assertStatus(200);

        $data = $response->json('data');
        // READY for delivery usually goes to OUT_FOR_DELIVERY only, COMPLETED is hidden.
        $this->assertCount(1, $data);
        $this->assertContains(OrderStatusEnum::OUT_FOR_DELIVERY->value, $data);
        $this->assertNotContains(OrderStatusEnum::COMPLETED->value, $data);
    }
}
