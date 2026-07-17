<?php

namespace Tests\Feature\User\RestaurantReview;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class DestroyTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_delete_their_own_review(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $review = RestaurantReview::factory()->create([
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
            'rating'        => 5,
        ]);

        // Act
        $response = $this->withToken($token)->deleteJson("/api/user/restaurants/{$restaurant->id}/reviews");

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_review.deleted'));

        $this->assertDatabaseMissing('restaurant_reviews', [
            'id' => $review->id,
        ]);

        // Assert observer updated restaurant stats (0 reviews left)
        $this->assertDatabaseHas('restaurants', [
            'id'             => $restaurant->id,
            'reviews_count'  => 0,
            'average_rating' => 0.0,
        ]);
    }

    public function test_user_cannot_delete_review_if_not_found(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create(); // No review

        // Act
        $response = $this->withToken($token)->deleteJson("/api/user/restaurants/{$restaurant->id}/reviews");

        // Assert
        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', trans('restaurant_review.not_found'));
    }
}
