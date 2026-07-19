<?php

namespace Tests\Feature\User\Cart;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AddItemToCartTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_add_item_to_cart()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
            'price'            => 100,
        ]);

        $payload = [
            'restaurant_id' => $restaurant->id,
            'item_id'       => $item->id,
            'quantity'      => 2,
            'notes'         => 'No onions',
        ];

        $response = $this->withToken($token)->postJson('/api/user/cart/items', $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        
        $this->assertDatabaseHas('carts', [
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);

        $cart = Cart::where('user_id', $user->id)->first();

        $this->assertDatabaseHas('cart_items', [
            'cart_id'    => $cart->id,
            'item_id'    => $item->id,
            'item_name'  => $item->title,
            'quantity'   => 2,
            'unit_price' => 100,
            'notes'      => 'No onions',
        ]);
    }

    public function test_fails_if_item_not_available()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'availability'     => MenuItemAvailabilityEnum::UNAVAILABLE->value,
        ]);

        $payload = [
            'restaurant_id' => $restaurant->id,
            'item_id'       => $item->id,
            'quantity'      => 1,
        ];

        $response = $this->withToken($token)->postJson('/api/user/cart/items', $payload);
        $response->assertStatus(400);
    }

    public function test_user_can_only_have_one_cart_across_all_restaurants()
    {
        [$user, $token] = $this->loginUser();

        // Restaurant 1
        $restaurant1 = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $category1 = MenuCategory::factory()->create(['restaurant_id' => $restaurant1->id]);
        $item1 = MenuItem::factory()->create([
            'menu_category_id' => $category1->id,
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
        ]);

        $this->withToken($token)->postJson('/api/user/cart/items', [
            'restaurant_id' => $restaurant1->id,
            'item_id'       => $item1->id,
            'quantity'      => 1,
        ]);

        $this->assertDatabaseHas('carts', [
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant1->id,
        ]);

        // Restaurant 2
        $restaurant2 = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $category2 = MenuCategory::factory()->create(['restaurant_id' => $restaurant2->id]);
        $item2 = MenuItem::factory()->create([
            'menu_category_id' => $category2->id,
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
        ]);

        $this->withToken($token)->postJson('/api/user/cart/items', [
            'restaurant_id' => $restaurant2->id,
            'item_id'       => $item2->id,
            'quantity'      => 1,
        ]);

        $this->assertDatabaseMissing('carts', [
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant1->id, // old cart deleted
        ]);

        $this->assertDatabaseHas('carts', [
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant2->id, // new cart created
        ]);
    }
}
