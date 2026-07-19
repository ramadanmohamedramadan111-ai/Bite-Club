<?php

namespace Tests\Feature\User\Cart;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class RemoveCartItemTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_remove_cart_item()
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

        $cartItem = CartItem::create([
            'cart_id' => $cart->id,
            'item_id' => $item->id,
            'item_name' => 'Burger',
            'quantity' => 2,
            'unit_price' => 50.00,
        ]);

        $response = $this->withToken($token)->deleteJson("/api/user/cart/items/{$cartItem->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);

        // Cart should also be deleted since it's empty
        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id,
        ]);
    }
}
