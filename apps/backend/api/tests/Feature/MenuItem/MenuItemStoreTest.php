<?php

namespace Tests\Feature\MenuItem;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

class MenuItemStoreTest extends RestaurantAuthTest
{
    public function test_restaurant_can_create_menu_item(): void
    {
        // Arrange
        Storage::fake('public');
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        
        $image = UploadedFile::fake()->create('burger.jpg', 100, 'image/jpeg');
        
        $payload = [
            'menu_category_id' => $category->id,
            'title' => 'Tasty Burger',
            'description' => 'A very tasty burger',
            'price' => 15.50,
            'availability' => MenuItemAvailabilityEnum::AVAILABLE->value,
            'image' => $image,
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/restaurant/menu-items', $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('menu_item.create_success'));
        $response->assertJsonPath('data.title', 'Tasty Burger');
        
        $this->assertDatabaseHas('items', [
            'menu_category_id' => $category->id,
            'title' => 'Tasty Burger',
        ]);
        
        // Assert file was uploaded
        $imageUrl = $response->json('data.image_url');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $imageUrl));
    }

    public function test_restaurant_cannot_create_duplicate_menu_item_in_same_category(): void
    {
        // Arrange
        Storage::fake('public');
        [$restaurant, $token] = $this->loginRestaurant();
        $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        
        MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'title' => 'Tasty Burger',
        ]);
        
        $image = UploadedFile::fake()->create('burger2.jpg', 100, 'image/jpeg');
        $payload = [
            'menu_category_id' => $category->id,
            'title' => 'Tasty Burger', // Duplicate title
            'description' => 'A very tasty burger',
            'price' => 15.50,
            'availability' => MenuItemAvailabilityEnum::AVAILABLE->value,
            'image' => $image,
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/restaurant/menu-items', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }
}
