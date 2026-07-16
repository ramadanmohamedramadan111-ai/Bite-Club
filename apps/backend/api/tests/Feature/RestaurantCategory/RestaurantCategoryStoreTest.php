<?php

namespace Tests\Feature\RestaurantCategory;

use App\Models\RestaurantCategory;
use Tests\Feature\Auth\AdminAuthTest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class RestaurantCategoryStoreTest extends AdminAuthTest
{
    public function test_admin_can_create_restaurant_category(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $payload = [
            'name' => 'Italian Food',
            'slug' => 'italian-food',
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/admin/restaurant-categories', $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_category.create_success'));
        $response->assertJsonPath('data.name', 'Italian Food');
        $response->assertJsonPath('data.slug', 'italian-food');

        $this->assertDatabaseHas('restaurant_categories', [
            'name' => 'Italian Food',
            'slug' => 'italian-food',
        ]);
    }

    public function test_admin_can_create_restaurant_category_with_auto_generated_slug(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $payload = [
            'name' => 'Mexican Food',
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/admin/restaurant-categories', $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('data.slug', 'mexican-food');

        $this->assertDatabaseHas('restaurant_categories', [
            'name' => 'Mexican Food',
            'slug' => 'mexican-food',
        ]);
    }

    public function test_admin_cannot_create_duplicate_restaurant_category(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        RestaurantCategory::factory()->create(['name' => 'Fast Food']);
        $payload = [
            'name' => 'Fast Food',
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/admin/restaurant-categories', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_admin_can_create_restaurant_category_with_image(): void
    {
        // Arrange
        Storage::fake('public');
        [$admin, $token] = $this->loginAdmin();
        
        $image = UploadedFile::fake()->create('category.jpg', 100, 'image/jpeg');
        
        $payload = [
            'name'  => 'Sushi',
            'image' => $image,
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/admin/restaurant-categories', $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Sushi');
        
        $imageUrl = $response->json('data.image_url');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $imageUrl));
    }
}
