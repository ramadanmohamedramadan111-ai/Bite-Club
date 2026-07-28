<?php

namespace Tests\Feature\User\Order;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Redemption;
use App\Models\Wallet;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CancelExpiredOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_console_command_cancels_expired_awaiting_payment_orders()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::AWAITING_PAYMENT->value,
            'created_at' => now()->subHours(2),
        ]);

        $payment = OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::ONLINE->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $this->artisan('orders:cancel-expired')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $this->assertDatabaseHas('order_payments', [
            'id' => $payment->id,
            'status' => PaymentStatusEnum::FAILED->value,
        ]);
    }

    public function test_console_command_does_not_cancel_recent_awaiting_payment_orders()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::AWAITING_PAYMENT->value,
            'created_at' => now()->subMinutes(10),
        ]);

        $this->artisan('orders:cancel-expired')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::AWAITING_PAYMENT->value,
        ]);
    }

    public function test_console_command_does_not_cancel_pending_orders_even_if_old()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now()->subHours(5),
        ]);

        $this->artisan('orders:cancel-expired')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);
    }

    public function test_expired_order_cancellation_refunds_loyalty_points()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::AWAITING_PAYMENT->value,
            'created_at' => now()->subHours(2),
        ]);

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );
        $wallet->balance = 50;
        $wallet->save();

        Redemption::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'points_redeemed' => 100,
            'discount_amount' => 10.0,
        ]);

        $this->artisan('orders:cancel-expired')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $user->id,
            'balance' => 150, // 50 existing + 100 refunded
        ]);
    }
}
