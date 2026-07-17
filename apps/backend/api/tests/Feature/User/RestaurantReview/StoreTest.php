<?php

namespace Tests\Feature\User\RestaurantReview;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_create_a_review(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $payload = [
            'rating'  => 4,
            'comment' => 'Great place!',
        ];

        // Act
        $response = $this->withToken($token)->postJson("/api/user/restaurants/{$restaurant->id}/reviews", $payload);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_review.created'));
        $response->assertJsonPath('data.rating', 4);
        $response->assertJsonPath('data.comment', 'Great place!');

        $this->assertDatabaseHas('restaurant_reviews', [
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
            'rating'        => 4,
            'comment'       => 'Great place!',
        ]);

        // Assert observer updated restaurant stats
        $this->assertDatabaseHas('restaurants', [
            'id'             => $restaurant->id,
            'reviews_count'  => 1,
            'average_rating' => 4.0,
        ]);
    }

    public function test_user_cannot_create_multiple_reviews_for_same_restaurant(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        // First review
        RestaurantReview::factory()->create([
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
            'rating'        => 3,
        ]);

        $payload = [
            'rating'  => 5,
            'comment' => 'Another review',
        ];

        // Act
        $response = $this->withToken($token)->postJson("/api/user/restaurants/{$restaurant->id}/reviews", $payload);

        // Assert
        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', trans('restaurant_review.already_reviewed'));
    }

    public function test_store_validates_input(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $payload = [
            'rating' => 6, // Invalid
        ];

        // Act
        $response = $this->withToken($token)->postJson("/api/user/restaurants/{$restaurant->id}/reviews", $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['rating']);
    }
}
