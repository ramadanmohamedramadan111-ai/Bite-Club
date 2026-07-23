<?php

namespace Tests\Feature\Loyalty;

use App\Models\User;
use App\Models\Order;
use App\Models\Wallet;
use App\Models\Referral;
use App\Models\UserWeeklyStreak;
use App\Models\UserBadge;
use App\Models\Redemption;
use App\Enums\Loyalty\ReferralStatusEnum;
use App\Enums\Loyalty\PointTransactionTypeEnum;
use App\Enums\Loyalty\PointTransactionSourceEnum;
use App\Enums\Loyalty\BadgeTypeEnum;
use App\Enums\Order\OrderStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class LoyaltyTest extends TestCase
{
    use RefreshDatabase;

    private function getHeadersForUser(User $user): array
    {
        $token = JWTAuth::fromUser($user);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    public function test_user_creation_creates_wallet_automatically(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseHas('wallets', [
            'user_id' => $user->id,
            'balance' => 0,
        ]);
    }

    public function test_can_fetch_wallet_and_transactions(): void
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;

        // Add some points
        $wallet->increment('balance', 500);

        // Fetch wallet
        $response = $this->getJson('/api/wallet', $this->getHeadersForUser($user));
        $response->assertOk();
        $response->assertJsonPath('data.balance', 500);
        $response->assertJsonPath('data.balance_in_egp', 50);

        // Log transaction manually for testing list
        $wallet->transactions()->create([
            'points' => 500,
            'type'   => PointTransactionTypeEnum::EARN->value,
            'source' => PointTransactionSourceEnum::REFERRAL->value,
        ]);

        $responseTrans = $this->getJson('/api/wallet/transactions', $this->getHeadersForUser($user));
        $responseTrans->assertOk();
        $responseTrans->assertJsonCount(1, 'data.items');
        $responseTrans->assertJsonPath('data.items.0.points', 500);
    }

    public function test_referral_flow(): void
    {
        $referrer = User::factory()->create();
        
        // Register referred user with referrer code
        $referred = User::factory()->create([
            'referred_by' => $referrer->id,
        ]);

        // Assert pending referral record is created automatically by UserObserver
        $this->assertDatabaseHas('referrals', [
            'referrer_id' => $referrer->id,
            'referred_id' => $referred->id,
            'status'      => ReferralStatusEnum::PENDING->value,
        ]);

        // Place and complete first order
        $order = Order::factory()->create([
            'user_id' => $referred->id,
            'total'   => 120.00,
            'status'  => OrderStatusEnum::PENDING->value,
        ]);

        // Transition order to completed
        $order->status = OrderStatusEnum::COMPLETED;
        $order->save();

        // Observer should fire. Verify referral is completed and referrer got 100 points
        $this->assertDatabaseHas('referrals', [
            'referrer_id'  => $referrer->id,
            'referred_id'  => $referred->id,
            'status'       => ReferralStatusEnum::COMPLETED->value,
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $referrer->id,
            'balance' => 100,
        ]);

        // Verify referred user got 0 points
        $this->assertDatabaseHas('wallets', [
            'user_id' => $referred->id,
            'balance' => 0,
        ]);
    }

    public function test_weekly_streak_accumulation_and_command_rewards(): void
    {
        $user2 = User::factory()->create();
        
        $o1 = Order::factory()->create(['user_id' => $user2->id, 'total' => 60.00, 'status' => OrderStatusEnum::PENDING->value]);
        $o2 = Order::factory()->create(['user_id' => $user2->id, 'total' => 70.00, 'status' => OrderStatusEnum::PENDING->value]);
        $o3 = Order::factory()->create(['user_id' => $user2->id, 'total' => 20.00, 'status' => OrderStatusEnum::PENDING->value]); // < 50
        $o4 = Order::factory()->create(['user_id' => $user2->id, 'total' => 80.00, 'status' => OrderStatusEnum::PENDING->value]);

        $o1->status = OrderStatusEnum::COMPLETED; $o1->save();
        $o2->status = OrderStatusEnum::COMPLETED; $o2->save();
        $o3->status = OrderStatusEnum::COMPLETED; $o3->save(); // Should not increment weekly streak count
        $o4->status = OrderStatusEnum::COMPLETED; $o4->save();

        // Verify completed_orders_count is 3 for user2 (o1, o2, o4)
        $this->assertDatabaseHas('user_weekly_streaks', [
            'user_id'                => $user2->id,
            'completed_orders_count' => 3,
        ]);

        // Run rewards command, but wait! The command only awards points for PAST weeks
        $streak = UserWeeklyStreak::where('user_id', $user2->id)->first();
        $streak->week_start_date = now()->subWeek()->startOfWeek(\Carbon\Carbon::TUESDAY)->toDateString();
        $streak->save();

        // Run the Artisan command
        Artisan::call('loyalty:grant-weekly-rewards');

        // User2 should receive 100 points and weekly_3_orders badge
        $this->assertDatabaseHas('wallets', [
            'user_id' => $user2->id,
            'balance' => 100,
        ]);

        $this->assertDatabaseHas('user_badges', [
            'user_id'    => $user2->id,
            'badge_type' => BadgeTypeEnum::WEEKLY_3_ORDERS->value,
        ]);
    }

    public function test_points_redemption_in_checkout_preview_and_place_order(): void
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        $wallet->update(['balance' => 1000]); // 1000 points = 100 EGP

        $restaurant = \App\Models\Restaurant::factory()->create();
        $restaurant->setting()->update([
            'accept_orders'     => true,
            'is_open'           => true,
            'delivery_enabled'  => true,
            'pickup_enabled'    => true,
            'latitude'          => 30.0,
            'longitude'         => 31.0,
            'delivery_radius'   => 10.0,
        ]);

        \App\Models\GeneralSetting::create([
            'commission_rate'    => 10,
            'service_fee_amount' => 5,
        ]);

        $cart = \App\Models\Cart::create([
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        $menuItem = \App\Models\MenuItem::factory()->create([
            'menu_category_id' => \App\Models\MenuCategory::factory()->create(['restaurant_id' => $restaurant->id])->id,
            'price'            => 100.00,
        ]);

        \App\Models\CartItem::create([
            'cart_id'    => $cart->id,
            'item_id'    => $menuItem->id,
            'item_name'  => 'Test Meal',
            'quantity'   => 1,
            'unit_price' => 100.00,
        ]);

        // 1. Preview Checkout with 500 points (50 EGP discount)
        $responsePreview = $this->postJson('/api/user/checkout/preview', [
            'order_type' => 'delivery',
            'lat'        => 30.0,
            'long'       => 31.0,
            'points'     => 500,
        ], $this->getHeadersForUser($user));

        $responsePreview->assertOk();
        $responsePreview->assertJsonPath('data.financials.discount_amount', 50);
        $responsePreview->assertJsonPath('data.financials.points_redeemed', 500);

        // Verify NO database changes occurred in preview
        $this->assertEquals(1000, $wallet->fresh()->balance);
        $this->assertDatabaseCount('redemptions', 0);

        // 2. Try placing order with points exceeding wallet balance (e.g. 1500 points)
        $responseExceed = $this->postJson('/api/user/checkout/place', [
            'order_type'        => 'delivery',
            'payment_option_id' => 'full_cash',
            'lat'               => 30.0,
            'long'              => 31.0,
            'points'            => 1500,
        ], $this->getHeadersForUser($user));

        $responseExceed->assertStatus(400);

        // 3. Place order with valid 500 points (50 EGP discount)
        $responsePlace = $this->postJson('/api/user/checkout/place', [
            'order_type'        => 'delivery',
            'payment_option_id' => 'full_cash',
            'lat'               => 30.0,
            'long'              => 31.0,
            'points'            => 500,
        ], $this->getHeadersForUser($user));

        $responsePlace->assertOk();
        $orderId = $responsePlace->json('data.order_id');

        // Verify Redemption record created
        $this->assertDatabaseHas('redemptions', [
            'user_id'         => $user->id,
            'order_id'        => $orderId,
            'points_redeemed' => 500,
            'discount_amount' => 50.00,
        ]);

        // Verify wallet balance updated (1000 - 500 = 500)
        $this->assertEquals(500, $wallet->fresh()->balance);
    }

    public function test_can_fetch_weekly_streak_progress(): void
    {
        $user = User::factory()->create();

        $response = $this->getJson('/api/wallet/streak', $this->getHeadersForUser($user));

        $response->assertOk();
        $response->assertJsonPath('data.completed_orders_count', 0);
        $response->assertJsonPath('data.next_tier.target_orders', 3);
        $response->assertJsonPath('data.next_tier.orders_needed', 3);
        $response->assertJsonPath('data.next_tier.reward_points', 100);
    }
}
