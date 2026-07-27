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
use App\Notifications\OrderCancelledByTimeoutNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CancelForgottenPendingOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_console_command_cancels_forgotten_pending_cash_orders_after_40_minutes()
    {
        Notification::fake();

        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now()->subMinutes(45),
        ]);

        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::CASH->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $this->artisan('orders:cancel-forgotten')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $this->assertDatabaseHas('order_payments', [
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::FAILED->value,
        ]);

        Notification::assertSentTo($user, OrderCancelledByTimeoutNotification::class);
    }

    public function test_console_command_does_not_cancel_recent_pending_cash_orders()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now()->subMinutes(20),
        ]);

        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::CASH->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $this->artisan('orders:cancel-forgotten')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);
    }

    public function test_console_command_does_not_cancel_pending_online_orders()
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now()->subMinutes(50),
        ]);

        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::ONLINE->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $this->artisan('orders:cancel-forgotten')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);
    }

    public function test_forgotten_cash_order_cancellation_refunds_loyalty_points()
    {
        Notification::fake();

        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
            'created_at' => now()->subMinutes(50),
        ]);

        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::CASH->value,
            'status' => PaymentStatusEnum::PENDING->value,
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

        $this->artisan('orders:cancel-forgotten')
             ->assertExitCode(0);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $this->assertDatabaseHas('order_payments', [
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::FAILED->value,
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $user->id,
            'balance' => 150, // 50 existing + 100 refunded
        ]);

        Notification::assertSentTo($user, OrderCancelledByTimeoutNotification::class);
    }
}
