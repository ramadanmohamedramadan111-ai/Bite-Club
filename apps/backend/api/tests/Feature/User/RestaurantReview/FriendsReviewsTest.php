<?php

namespace Tests\Feature\User\RestaurantReview;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use App\Models\Friendship;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class FriendsReviewsTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(User $user = null): array
    {
        $user = $user ?: User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_unauthenticated_user_cannot_list_friends_reviews(): void
    {
        $restaurant = Restaurant::factory()->create();
        $response = $this->getJson("/api/user/restaurants/{$restaurant->id}/friends-reviews");
        $response->assertStatus(401);
    }

    public function test_user_can_list_friends_reviews(): void
    {
        // Arrange
        [$user, $token] = $this->loginUser();
        $restaurant = Restaurant::factory()->create();

        // Create 2 friends
        $friend1 = User::factory()->create();
        $friend2 = User::factory()->create();

        // Establish friendships
        Friendship::create([
            'user_low_id' => min($user->id, $friend1->id),
            'user_high_id' => max($user->id, $friend1->id),
        ]);
        Friendship::create([
            'user_low_id' => min($user->id, $friend2->id),
            'user_high_id' => max($user->id, $friend2->id),
        ]);

        // Create reviews
        // Friend 1 review (rating 5)
        RestaurantReview::factory()->create([
            'restaurant_id' => $restaurant->id,
            'user_id' => $friend1->id,
            'rating' => 5,
        ]);
        // Friend 2 review (rating 4)
        RestaurantReview::factory()->create([
            'restaurant_id' => $restaurant->id,
            'user_id' => $friend2->id,
            'rating' => 4,
        ]);
        // Non-friend review
        RestaurantReview::factory()->create([
            'restaurant_id' => $restaurant->id,
            'rating' => 2,
        ]);

        // Act
        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/friends-reviews");

        // Assert
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.summary.total_reviews', 2);
        $response->assertJsonPath('data.summary.average_rating', 4.5);
        $this->assertCount(2, $response->json('data.items'));

        // Assert structure
        $response->assertJsonStructure([
            'data' => [
                'summary' => [
                    'total_reviews',
                    'average_rating'
                ],
                'items' => [
                    '*' => [
                        'id',
                        'rating',
                        'comment',
                        'user' => [
                            'id',
                            'name',
                            'profile_image'
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
