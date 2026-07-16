<?php

namespace Tests\Feature\RestaurantCategory;

use App\Models\RestaurantCategory;
use Tests\Feature\Auth\AdminAuthTest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class RestaurantCategoryUpdateTest extends AdminAuthTest
{
    public function test_admin_can_update_restaurant_category(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $category = RestaurantCategory::factory()->create(['name' => 'Old Name', 'slug' => 'old-name']);
        $payload = [
            'name' => 'New Name',
        ];

        // Act
        $response = $this->withToken($token)->postJson("/api/admin/restaurant-categories/{$category->id}", $payload);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_category.update_success'));
        $response->assertJsonPath('data.name', 'New Name');
        $response->assertJsonPath('data.slug', 'new-name');

        $this->assertDatabaseHas('restaurant_categories', [
            'id'   => $category->id,
            'name' => 'New Name',
            'slug' => 'new-name',
        ]);
    }

    public function test_admin_receives_422_if_updating_non_existent_category(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();
        $payload = [
            'name' => 'New Name',
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/admin/restaurant-categories/999', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['id']);
    }

    public function test_admin_can_update_restaurant_category_with_image(): void
    {
        // Arrange
        Storage::fake('public');
        [$admin, $token] = $this->loginAdmin();
        $category = RestaurantCategory::factory()->create(['name' => 'Old Name', 'slug' => 'old-name']);
        
        $image = UploadedFile::fake()->create('category.jpg', 100, 'image/jpeg');
        
        $payload = [
            'name'  => 'New Name',
            'image' => $image,
        ];

        // Act
        $response = $this->withToken($token)->postJson("/api/admin/restaurant-categories/{$category->id}", $payload);

        // Assert
        $response->assertOk();
        
        $imageUrl = $response->json('data.image_url');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $imageUrl));
    }
}
