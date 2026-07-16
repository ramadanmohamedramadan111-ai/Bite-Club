<?php

namespace Tests\Feature\User\RestaurantCategory;

use App\Models\User;
use App\Models\RestaurantCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class RestaurantCategoryIndexTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_list_all_restaurant_categories(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        
        // Create 3 categories
        RestaurantCategory::factory()->count(3)->create();

        // Act
        $response = $this->withToken($token)->getJson('/api/user/restaurant-categories');

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_category.list_success'));
        
        // Assert we got exactly 3 items back in the data array
        $this->assertCount(3, $response->json('data.items'));
        
        // Assert the structure is correct (id, name, slug, image_url) without pagination meta
        $response->assertJsonStructure([
            'data' => [
                'items' => [
                    '*' => ['id', 'name', 'slug', 'image_url']
                ]
            ]
        ]);
        
        // Assert meta does not exist since we don't want pagination
        $response->assertJsonMissing(['data' => ['meta' => []]]);
    }
}
