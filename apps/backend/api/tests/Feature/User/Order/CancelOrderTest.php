<?php

namespace Tests\Feature\User\Order;

use App\Enums\Order\OrderStatusEnum;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentStatusEnum;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Redemption;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class CancelOrderTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_cancel_pending_order_without_notification_or_mail()
    {
        Notification::fake();
        Mail::fake();

        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::CASH->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $response = $this->withToken($token)->postJson("/api/user/orders/{$order->id}/cancel");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.status', OrderStatusEnum::CANCELLED->value);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::CANCELLED->value,
        ]);

        $this->assertDatabaseHas('order_payments', [
            'order_id' => $order->id,
            'status' => PaymentStatusEnum::FAILED->value,
        ]);

        Notification::assertNothingSent();
        Mail::assertNothingSent();
    }

    public function test_user_cannot_cancel_preparing_order()
    {
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PREPARING->value,
        ]);

        $response = $this->withToken($token)->postJson("/api/user/orders/{$order->id}/cancel");

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::PREPARING->value,
        ]);
    }

    public function test_user_cannot_cancel_other_users_order()
    {
        [$user, $token] = $this->loginUser();
        $otherUser = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $otherUser->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        $response = $this->withToken($token)->postJson("/api/user/orders/{$order->id}/cancel");

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);
    }

    public function test_canceling_order_refunds_loyalty_points()
    {
        Notification::fake();
        Mail::fake();

        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );
        $wallet->balance = 100;
        $wallet->save();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        Redemption::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'points_redeemed' => 50,
            'discount_amount' => 10.00,
        ]);

        $response = $this->withToken($token)->postJson("/api/user/orders/{$order->id}/cancel");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertEquals(150, $wallet->fresh()->balance);
        Notification::assertNothingSent();
        Mail::assertNothingSent();
    }

    public function test_user_cannot_cancel_pending_order_with_online_payment()
    {
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);

        OrderPayment::factory()->create([
            'order_id' => $order->id,
            'payment_method' => PaymentMethodEnum::ONLINE->value,
            'status' => PaymentStatusEnum::PENDING->value,
        ]);

        $response = $this->withToken($token)->postJson("/api/user/orders/{$order->id}/cancel");

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => OrderStatusEnum::PENDING->value,
        ]);
    }
}
