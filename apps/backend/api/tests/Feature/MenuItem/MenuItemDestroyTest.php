<?php

namespace Tests\Feature\MenuItem;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Storage;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class MenuItemDestroyTest extends RestaurantAuthTest
{
    public function test_restaurant_can_delete_menu_item(): void
    {
        // Arrange
        Storage::fake('public');
        
        // Put a fake file in storage so we can assert it was deleted
        Storage::disk('public')->put('menu_items/test_image.jpg', 'fake content');
        
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'image_url' => '/storage/menu_items/test_image.jpg'
        ]);

        // Act
        $response = $this->withToken($token)->deleteJson("/api/restaurant/menu-items/{$item->id}");

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_item.delete_success'));

        $this->assertDatabaseMissing('items', [
            'id' => $item->id,
        ]);
        
        // Ensure the image file was deleted
        Storage::disk('public')->assertMissing('menu_items/test_image.jpg');
    }

    public function test_restaurant_cannot_delete_other_restaurants_menu_item(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();
        
        $otherRestaurant = $this->createRestaurant();
        $otherCategory = MenuCategory::factory()->create(['restaurant_id' => $otherRestaurant->id]);
        $item = MenuItem::factory()->create(['menu_category_id' => $otherCategory->id]);

        // Act
        $response = $this->withToken($token)->deleteJson("/api/restaurant/menu-items/{$item->id}");

        // Assert
        $response->assertStatus(404);
        $response->assertJsonPath('message', trans('menu_item.not_found'));

        $this->assertDatabaseHas('items', [
            'id' => $item->id,
        ]);
    }
}
