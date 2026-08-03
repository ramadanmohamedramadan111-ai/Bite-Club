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

class MergeCartTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_merge_guest_cart()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        
        $item1 = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
            'price'            => 50,
        ]);
        
        $item2 = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
            'price'            => 150,
        ]);

        // Pre-create an item in the user's cart in the DB (for item1)
        $cart = Cart::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
        ]);
        CartItem::create([
            'cart_id' => $cart->id,
            'item_id' => $item1->id,
            'item_name' => $item1->title,
            'quantity' => 2,
            'unit_price' => 50,
            'notes' => 'Old note',
        ]);

        // Payload representing guest cart (merge item1 and item2)
        $payload = [
            'restaurant_id' => $restaurant->id,
            'items' => [
                [
                    'item_id' => $item1->id,
                    'quantity' => 3,
                    'notes' => 'New note',
                ],
                [
                    'item_id' => $item2->id,
                    'quantity' => 1,
                    'notes' => 'Instructions',
                ]
            ]
        ];

        $response = $this->withToken($token)->postJson('/api/user/cart/merge', $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        // Verify quantities are merged: item1 should have 2 + 3 = 5 quantity
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $cart->id,
            'item_id' => $item1->id,
            'quantity' => 5,
            'notes' => 'New note', // notes updated
        ]);

        // Verify new item is added
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $cart->id,
            'item_id' => $item2->id,
            'quantity' => 1,
            'notes' => 'Instructions',
        ]);
    }
}
