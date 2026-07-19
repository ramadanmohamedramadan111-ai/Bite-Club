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

class CheckoutPreviewTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_preview_pickup_checkout()
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
            'unit_price' => 100.00, // subtotal = 200
        ]);

        $payload = [
            'cart_id' => $cart->id,
            'order_type' => OrderTypeEnum::PICKUP->value,
        ];

        $response = $this->withToken($token)->postJson("/api/user/checkout/preview", $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        
        $response->assertJsonPath('data.cart_id', $cart->id);
        $response->assertJsonPath('data.order_type', 'pickup');
        
        // subtotal: 200, service_fee: 5, total: 205
        $response->assertJsonPath('data.financials.subtotal', 200);
        $response->assertJsonPath('data.financials.service_fee', 5);
        $response->assertJsonPath('data.financials.total', 205);
        
        // deposit: total >= 100 (205 >= 100) -> 50% deposit
        $response->assertJsonPath('data.deposit_rules.requires_deposit', true);
        $response->assertJsonPath('data.deposit_rules.deposit_percentage', 50);
        $response->assertJsonPath('data.deposit_rules.deposit_amount', 102.5);
        $response->assertJsonPath('data.deposit_rules.remaining_amount', 102.5);
        
        // system_commission: 10% of 200 = 20
        $response->assertJsonPath('data.internal_data.system_commission', 20);
    }
}
