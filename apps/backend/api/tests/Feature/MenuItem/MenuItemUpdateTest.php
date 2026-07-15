<?php

namespace Tests\Feature\MenuItem;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

class MenuItemUpdateTest extends RestaurantAuthTest
{
    public function test_restaurant_can_update_menu_item(): void
    {
        // Arrange
        Storage::fake('public');
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create(['menu_category_id' => $category->id]);
        
        $payload = [
            'menu_category_id' => $category->id,
            'title' => 'Updated Tasty Burger',
            'description' => 'Updated desc',
            'price' => 20.00,
            // Not sending image to test updating without image
        ];

        // Act
        $response = $this->withToken($token)->postJson("/api/restaurant/menu-items/{$item->id}", $payload);

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_item.update_success'));
        $response->assertJsonPath('data.title', 'Updated Tasty Burger');

        $this->assertDatabaseHas('items', [
            'id' => $item->id,
            'title' => 'Updated Tasty Burger',
        ]);
    }

    public function test_restaurant_can_update_menu_item_with_new_image(): void
    {
        // Arrange
        Storage::fake('public');
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $item = MenuItem::factory()->create(['menu_category_id' => $category->id, 'image_url' => '/storage/menu_items/old_image.jpg']);
        
        $newImage = UploadedFile::fake()->create('new_burger.jpg', 100, 'image/jpeg');
        $payload = [
            'menu_category_id' => $category->id,
            'title' => 'Updated Tasty Burger 2',
            'description' => 'Updated desc',
            'price' => 20.00,
            'image' => $newImage,
        ];

        // Act
        $response = $this->withToken($token)->postJson("/api/restaurant/menu-items/{$item->id}", $payload);

        // Assert
        $response->assertStatus(200);
        
        // Assert new file was uploaded
        $imageUrl = $response->json('data.image_url');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $imageUrl));
    }
}
