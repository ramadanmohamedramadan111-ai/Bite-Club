<?php

namespace Tests\Feature\Restaurant\Payment;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\OrderPayment;
use App\Models\Order;
use App\Models\User;
use App\Models\Restaurant;
use App\Enums\Payment\PaymentStatusEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentTypeEnum;

class RestaurantPaymentTest extends TestCase
{
    use RefreshDatabase;

    private Restaurant $restaurant;
    private OrderPayment $payment;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->restaurant = Restaurant::factory()->create();
        $user = User::factory()->create();
        
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $this->restaurant->id,
            'total' => 100.0,
        ]);

        $this->payment = OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_type' => PaymentTypeEnum::FULL->value,
            'payment_method' => PaymentMethodEnum::ONLINE->value,
            'status' => PaymentStatusEnum::PAID->value,
            'amount' => 100.0,
        ]);
    }

    public function test_restaurant_can_list_payments(): void
    {
        $response = $this->actingAs($this->restaurant, 'restaurant')->getJson('/api/restaurant/payments');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'order_id',
                            'transaction_id',
                            'payment_type',
                            'payment_method',
                            'amount',
                            'status',
                            'user' => ['id', 'name', 'email']
                        ]
                    ],
                    'meta'
                ]
            ]);
    }

    public function test_restaurant_cannot_see_other_restaurant_payments(): void
    {
        $otherRestaurant = Restaurant::factory()->create();
        $otherOrder = Order::factory()->create(['restaurant_id' => $otherRestaurant->id, 'total' => 50.0]);
        OrderPayment::factory()->create([
            'order_id' => $otherOrder->id,
            'status' => PaymentStatusEnum::PAID->value,
        ]);

        $response = $this->actingAs($this->restaurant, 'restaurant')->getJson('/api/restaurant/payments');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_restaurant_can_get_payment_statistics(): void
    {
        OrderPayment::factory()->create([
            'order_id' => Order::factory()->create(['restaurant_id' => $this->restaurant->id])->id,
            'status' => PaymentStatusEnum::PENDING->value,
            'amount' => 50.0,
        ]);

        $response = $this->actingAs($this->restaurant, 'restaurant')->getJson('/api/restaurant/payments/statistics');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_paid' => 100.0,
                    'total_pending' => 50.0,
                    'total_failed' => 0.0,
                ]
            ]);
    }
}
