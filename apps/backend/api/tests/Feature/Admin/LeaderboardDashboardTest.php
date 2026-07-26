<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\User;
use App\Models\Post;
use App\Models\Restaurant;
use App\Models\PostImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class LeaderboardDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function getHeadersForAdmin(Admin $admin): array
    {
        $token = JWTAuth::fromUser($admin);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    public function test_guest_cannot_access_leaderboard_dashboard(): void
    {
        $response = $this->getJson('/api/admin/leaderboard/dashboard');
        $response->assertStatus(401);
    }

    public function test_admin_can_retrieve_leaderboard_dashboard(): void
    {
        $admin = Admin::factory()->create();

        // Seed Users
        $user1 = User::factory()->create(['first_name' => 'Ahmed', 'last_name' => 'Hassan']);
        $user2 = User::factory()->create(['first_name' => 'Kareem', 'last_name' => 'Kadry']);

        // Seed Restaurants
        $restaurant1 = Restaurant::factory()->create(['name' => 'KFC']);
        $restaurant2 = Restaurant::factory()->create(['name' => 'McDonalds']);

        // Seed Posts for Restaurant 1
        $post1 = Post::factory()->create([
            'user_id'       => $user1->id,
            'restaurant_id' => $restaurant1->id,
            'copy_count'    => 10,
            'caption'       => 'Best KFC Meal',
        ]);
        PostImage::create([
            'post_id'   => $post1->id,
            'image_url' => 'http://localhost/storage/posts/kfc.jpg',
            'position'  => 0,
        ]);

        $post2 = Post::factory()->create([
            'user_id'       => $user2->id,
            'restaurant_id' => $restaurant1->id,
            'copy_count'    => 15,
            'caption'       => 'KFC bucket',
        ]);

        // Seed Posts for Restaurant 2
        $post3 = Post::factory()->create([
            'user_id'       => $user1->id,
            'restaurant_id' => $restaurant2->id,
            'copy_count'    => 5,
            'caption'       => 'Big Mac',
        ]);

        $headers = $this->getHeadersForAdmin($admin);
        $response = $this->getJson('/api/admin/leaderboard/dashboard', $headers);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'summary' => [
                    'total_posts',
                    'total_copies',
                    'active_users',
                    'active_restaurants',
                ],
                'top_posts' => [
                    '*' => [
                        'id',
                        'image_url',
                        'caption',
                        'copy_count',
                        'created_at',
                        'user' => [
                            'id',
                            'full_name',
                        ],
                        'restaurant' => [
                            'id',
                            'name',
                        ],
                    ]
                ],
                'top_restaurants' => [
                    '*' => [
                        'id',
                        'name',
                        'posts_count',
                        'total_copies',
                    ]
                ]
            ]
        ]);

        // Assert counts are correct
        $this->assertEquals(3, $response->json('data.summary.total_posts'));
        $this->assertEquals(30, $response->json('data.summary.total_copies')); // 10 + 15 + 5
        $this->assertEquals(2, $response->json('data.summary.active_users')); // Ahmed, Kareem
        $this->assertEquals(2, $response->json('data.summary.active_restaurants')); // KFC, McDonalds

        // Assert top posts order (post2 with 15 copies, post1 with 10, post3 with 5)
        $this->assertEquals($post2->id, $response->json('data.top_posts.0.id'));
        $this->assertEquals(15, $response->json('data.top_posts.0.copy_count'));
        $this->assertNull($response->json('data.top_posts.0.image_url'));

        $this->assertEquals($post1->id, $response->json('data.top_posts.1.id'));
        $this->assertEquals(10, $response->json('data.top_posts.1.copy_count'));
        $this->assertStringContainsString('/storage/posts/kfc.jpg', $response->json('data.top_posts.1.image_url'));

        // Assert top restaurants order
        // KFC (restaurant1) has 2 posts and 25 copies total (10 + 15)
        // McDonalds (restaurant2) has 1 post and 5 copies total
        $this->assertEquals($restaurant1->id, $response->json('data.top_restaurants.0.id'));
        $this->assertEquals(2, $response->json('data.top_restaurants.0.posts_count'));
        $this->assertEquals(25, $response->json('data.top_restaurants.0.total_copies'));

        $this->assertEquals($restaurant2->id, $response->json('data.top_restaurants.1.id'));
        $this->assertEquals(1, $response->json('data.top_restaurants.1.posts_count'));
        $this->assertEquals(5, $response->json('data.top_restaurants.1.total_copies'));
    }
}
