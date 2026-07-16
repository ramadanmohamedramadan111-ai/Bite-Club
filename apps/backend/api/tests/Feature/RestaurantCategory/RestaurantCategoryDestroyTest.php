<?php

namespace Tests\Feature\RestaurantCategory;

use App\Models\RestaurantCategory;
use Tests\Feature\Auth\AdminAuthTest;
use Illuminate\Support\Facades\Storage;

class RestaurantCategoryDestroyTest extends AdminAuthTest
{
    public function test_admin_can_delete_restaurant_category(): void
    {
        // Arrange
        Storage::fake('public');
        Storage::disk('public')->put('restaurant_categories/test_image.jpg', 'fake content');

        [$admin, $token] = $this->loginAdmin();
        $category = RestaurantCategory::factory()->create([
            'image_url' => '/storage/restaurant_categories/test_image.jpg'
        ]);

        // Act
        $response = $this->withToken($token)->deleteJson("/api/admin/restaurant-categories/{$category->id}");

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_category.delete_success'));

        $this->assertDatabaseMissing('restaurant_categories', [
            'id' => $category->id,
        ]);

        Storage::disk('public')->assertMissing('restaurant_categories/test_image.jpg');
    }

    public function test_admin_receives_422_if_deleting_non_existent_category(): void
    {
        // Arrange
        [$admin, $token] = $this->loginAdmin();

        // Act
        $response = $this->withToken($token)->deleteJson('/api/admin/restaurant-categories/999');

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['id']);
    }
}
