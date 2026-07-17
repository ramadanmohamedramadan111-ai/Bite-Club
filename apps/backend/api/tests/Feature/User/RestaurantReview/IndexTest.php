<?php

namespace Tests\Feature\User\RestaurantReview;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class IndexTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_list_restaurant_reviews(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        // Create 15 reviews
        RestaurantReview::factory()->count(15)->create([
            'restaurant_id' => $restaurant->id,
        ]);

        // Act
        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/reviews?per_page=10");

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_review.listed'));
        
        // Assert pagination
        $this->assertCount(10, $response->json('data.items'));
        $this->assertEquals(15, $response->json('data.meta.total'));
        
        // Assert structure
        $response->assertJsonStructure([
            'data' => [
                'items' => [
                    '*' => [
                        'id',
                        'rating',
                        'comment',
                        'user' => [
                            'id',
                            'name',
                            'profile_image_url'
                        ],
                        'created_at'
                    ]
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                    'last_page'
                ]
            ]
        ]);
    }
}
