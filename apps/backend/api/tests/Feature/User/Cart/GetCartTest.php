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

class GetCartTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_get_cart()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
            'price'            => 100,
        ]);

        $cart = Cart::create([
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        CartItem::create([
            'cart_id'    => $cart->id,
            'item_id'    => $item->id,
            'item_name'  => $item->title,
            'quantity'   => 2,
            'unit_price' => 100,
            'notes'      => 'No onions',
        ]);

        $response = $this->withToken($token)->getJson('/api/user/cart');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.id', $cart->id);
        $response->assertJsonPath('data.restaurant.id', $restaurant->id);
        $response->assertJsonCount(1, 'data.items');
        $response->assertJsonPath('data.items.0.item_id', $item->id);
        $response->assertJsonPath('data.items.0.quantity', 2);
    }
}
