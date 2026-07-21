<?php

namespace Tests\Feature\Restaurant;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentStatusEnum;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class UpdateOrderStatusTest extends TestCase
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
        $response = $this->patchJson('/api/restaurant/orders/1/status', [
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        $response->assertStatus(401);
    }

    public function test_it_returns_validation_error_if_order_belongs_to_another_restaurant()
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
        ])->patchJson("/api/restaurant/orders/{$order->id}/status", [
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['order_id']);
    }

    public function test_it_returns_validation_error_for_invalid_status()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->patchJson("/api/restaurant/orders/{$order->id}/status", [
            'status' => 'invalid_status_xyz',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['status']);
    }

    public function test_it_returns_bad_request_if_transition_is_not_allowed()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        // Attempting to jump directly from PENDING to COMPLETED (not allowed)
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->patchJson("/api/restaurant/orders/{$order->id}/status", [
            'status' => OrderStatusEnum::COMPLETED->value,
        ]);

        $response->assertStatus(400)
                 ->assertJsonPath('success', false)
                 ->assertJsonPath('message', "Cannot change order status from pending to completed.");
    }

    public function test_it_successfully_updates_order_status_if_transition_is_valid()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->patchJson("/api/restaurant/orders/{$order->id}/status", [
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::PREPARING->value,
        ]);
    }

    public function test_it_marks_pending_payments_as_paid_when_order_is_completed()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::OUT_FOR_DELIVERY->value,
        ]);

        $payment = OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::CASH->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->patchJson("/api/restaurant/orders/{$order->id}/status", [
            'status' => OrderStatusEnum::COMPLETED->value,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::COMPLETED->value,
        ]);

        $this->assertDatabaseHas('order_payments', [
            'id' => $payment->id,
            'status' => PaymentStatusEnum::PAID->value,
        ]);
    }

    public function test_it_marks_pending_payments_as_failed_when_order_is_cancelled()
    {
        $order = Order::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'user_id' => $this->user->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        $payment = OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::CASH->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->patchJson("/api/restaurant/orders/{$order->id}/status", [
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $this->assertDatabaseHas('order_payments', [
            'id' => $payment->id,
            'status' => PaymentStatusEnum::FAILED->value,
        ]);
    }
}
