<?php

namespace Tests\Feature\User\Order;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantSetting;
use App\Models\GeneralSetting;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class PlaceOrderTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_place_pickup_order()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update([
            'is_open' => true,
            'accept_orders' => true,
            'pickup_enabled' => true,
            'deposit_threshold' => 100,
            'deposit_percentage' => 50,
        ]);

        GeneralSetting::create([
            'commission_rate' => 10,
            'service_fee_amount' => 5,
        ]);

        $cart = Cart::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);
        
        $menuItem = MenuItem::factory()->create([
            'menu_category_id' => MenuCategory::factory()->create(['restaurant_id' => $restaurant->id])->id,
            'price' => 100.00,
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'item_id' => $menuItem->id,
            'item_name' => 'Burger',
            'quantity' => 2,
            'unit_price' => 100.00,
        ]);

        $payload = [
            'order_type' => OrderTypeEnum::PICKUP->value,
            'payment_option_id' => 'split_payment',
        ];

        $response = $this->withToken($token)->postJson("/api/user/checkout/place", $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.status', 'pending');
        
        $orderId = $response->json('data.order_id');
        $this->assertNotNull($orderId);

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'user_id' => $user->id,
            'status' => 'pending',
            'total' => 205,
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'item_id' => $menuItem->id,
            'quantity' => 2,
        ]);

        $this->assertDatabaseHas('order_payments', [
            'order_id' => $orderId,
            'payment_type' => 'deposit',
            'payment_method' => 'online',
            'amount' => 102.5,
        ]);

        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id,
        ]);
    }
}
