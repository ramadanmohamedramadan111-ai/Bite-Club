<?php

namespace Tests\Feature\User\Cart;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Group;
use App\Models\GroupOrder;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ClearCartTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_unauthorized_user_cannot_clear_cart()
    {
        $response = $this->deleteJson('/api/user/cart');

        $response->assertStatus(401);
    }

    public function test_user_can_clear_individual_cart()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $cart = Cart::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'group_order_id' => null,
        ]);
        
        $item = MenuItem::factory()->create([
            'menu_category_id' => MenuCategory::factory()->create(['restaurant_id' => $restaurant->id])->id,
        ]);

        $cartItem = CartItem::create([
            'cart_id' => $cart->id,
            'item_id' => $item->id,
            'item_name' => 'Pizza',
            'quantity' => 2,
            'unit_price' => 100.00,
        ]);

        $response = $this->withToken($token)->deleteJson('/api/user/cart');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);

        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id,
        ]);
    }

    public function test_user_can_clear_individual_cart_using_explicit_endpoint()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $cart = Cart::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'group_order_id' => null,
        ]);

        $response = $this->withToken($token)->deleteJson('/api/user/cart/clear');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id,
        ]);
    }

    public function test_clear_individual_cart_does_not_affect_group_order_cart()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        
        // Individual cart
        $individualCart = Cart::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'group_order_id' => null,
        ]);

        // Group order cart
        $group = Group::factory()->create(['owner_user_id' => $user->id]);
        $groupOrder = GroupOrder::create([
            'group_id' => $group->id,
            'host_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => 'open',
            'expires_at' => now()->addHours(2),
        ]);

        $groupCart = Cart::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'group_order_id' => $groupOrder->id,
        ]);

        $response = $this->withToken($token)->deleteJson('/api/user/cart');

        $response->assertStatus(200);

        // Individual cart should be deleted
        $this->assertDatabaseMissing('carts', [
            'id' => $individualCart->id,
        ]);

        // Group cart MUST remain untouched
        $this->assertDatabaseHas('carts', [
            'id' => $groupCart->id,
            'group_order_id' => $groupOrder->id,
        ]);
    }
}
