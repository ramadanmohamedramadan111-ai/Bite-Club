<?php

namespace Tests\Feature\User\RestaurantReview;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class UpdateTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_update_their_own_review(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        $review = RestaurantReview::factory()->create([
            'user_id'       => $user->id,
            'restaurant_id' => $restaurant->id,
            'rating'        => 2,
            'comment'       => 'Not good',
        ]);

        $payload = [
            'rating'  => 5,
            'comment' => 'Much better now',
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/user/restaurants/{$restaurant->id}/reviews", $payload);

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('restaurant_review.updated'));
        $response->assertJsonPath('data.rating', 5);
        $response->assertJsonPath('data.comment', 'Much better now');

        $this->assertDatabaseHas('restaurant_reviews', [
            'id'      => $review->id,
            'rating'  => 5,
            'comment' => 'Much better now',
        ]);

        // Assert observer updated restaurant stats
        $this->assertDatabaseHas('restaurants', [
            'id'             => $restaurant->id,
            'reviews_count'  => 1,
            'average_rating' => 5.0,
        ]);
    }

    public function test_user_cannot_update_review_if_not_found(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create(); // No review created

        $payload = [
            'rating' => 4,
        ];

        // Act
        $response = $this->withToken($token)->putJson("/api/user/restaurants/{$restaurant->id}/reviews", $payload);

        // Assert
        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', trans('restaurant_review.not_found'));
    }
}
