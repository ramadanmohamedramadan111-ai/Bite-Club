<?php

namespace Tests\Feature\User\Cart;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ListCartsTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_list_carts()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $cart = Cart::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);
        
        $item = MenuItem::factory()->create([
            'menu_category_id' => MenuCategory::factory()->create(['restaurant_id' => $restaurant->id])->id,
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'item_id' => $item->id,
            'item_name' => 'Burger',
            'quantity' => 2,
            'unit_price' => 50.00,
        ]);

        $response = $this->withToken($token)->getJson('/api/user/carts');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $cart->id);
        $response->assertJsonPath('data.0.restaurant.id', $restaurant->id);
        $response->assertJsonPath('data.0.subtotal', 100);
        $response->assertJsonCount(1, 'data.0.items');
        $response->assertJsonPath('data.0.items.0.item_name', 'Burger');
        $response->assertJsonPath('data.0.items.0.total_price', 100);
    }
}
