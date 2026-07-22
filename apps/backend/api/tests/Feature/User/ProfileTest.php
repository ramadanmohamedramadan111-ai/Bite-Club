<?php

namespace Tests\Feature\User;

use App\Models\User;
use App\Models\Post;
use App\Models\Friendship;
use App\Models\Restaurant;
use App\Models\Order;
use App\Enums\Order\OrderStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function getHeadersForUser(User $user): array
    {
        $token = JWTAuth::fromUser($user);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    public function test_authenticated_user_profile_includes_posts_count_and_friends_count(): void
    {
        $user = User::factory()->create();

        // Create some posts for the user
        $restaurant = Restaurant::factory()->create();
        $order1 = Order::factory()->create(['user_id' => $user->id, 'restaurant_id' => $restaurant->id, 'status' => OrderStatusEnum::COMPLETED]);
        $order2 = Order::factory()->create(['user_id' => $user->id, 'restaurant_id' => $restaurant->id, 'status' => OrderStatusEnum::COMPLETED]);

        Post::factory()->create(['user_id' => $user->id, 'order_id' => $order1->id, 'restaurant_id' => $restaurant->id]);
        Post::factory()->create(['user_id' => $user->id, 'order_id' => $order2->id, 'restaurant_id' => $restaurant->id]);

        // Create a deleted post (which should be excluded)
        $deletedPost = Post::factory()->create(['user_id' => $user->id, 'order_id' => $order1->id, 'restaurant_id' => $restaurant->id]);
        $deletedPost->delete();

        // Create friendships
        $friend1 = User::factory()->create();
        $friend2 = User::factory()->create();

        // user is low id
        Friendship::create([
            'user_low_id'  => min($user->id, $friend1->id),
            'user_high_id' => max($user->id, $friend1->id),
        ]);

        // user is high id
        Friendship::create([
            'user_low_id'  => min($user->id, $friend2->id),
            'user_high_id' => max($user->id, $friend2->id),
        ]);

        $response = $this->getJson('/api/user/me', $this->getHeadersForUser($user));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.posts_count', 2)
            ->assertJsonPath('data.friends_count', 2);
    }

    public function test_update_profile_successfully(): void
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name'  => 'Doe',
            'username'   => 'johndoe',
        ]);

        $payload = [
            'first_name' => 'Jane',
            'last_name'  => 'Smith',
            'username'   => 'janesmith',
        ];

        $response = $this->patchJson('/api/user/profile', $payload, $this->getHeadersForUser($user));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.first_name', 'Jane')
            ->assertJsonPath('data.last_name', 'Smith')
            ->assertJsonPath('data.username', 'janesmith');

        $this->assertDatabaseHas('users', [
            'id'         => $user->id,
            'first_name' => 'Jane',
            'last_name'  => 'Smith',
            'username'   => 'janesmith',
        ]);
    }

    public function test_username_must_be_unique(): void
    {
        $user1 = User::factory()->create(['username' => 'takenusername']);
        $user2 = User::factory()->create(['username' => 'myusername']);

        $payload = [
            'username' => 'takenusername',
        ];

        $response = $this->patchJson('/api/user/profile', $payload, $this->getHeadersForUser($user2));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_update_profile_image(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        // Use UploadedFile::fake()->create to avoid GD library imagejpeg/imagepng dependency
        $file = UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg');

        $response = $this->patchJson('/api/user/profile', [
            'profile_image' => $file,
        ], $this->getHeadersForUser($user));

        $response->assertOk()
            ->assertJsonPath('success', true);

        $user->refresh();
        $this->assertNotNull($user->profile_image_url);

        $filename = basename($user->profile_image_url);
        Storage::disk('public')->assertExists('profile_images/' . $filename);
    }

    public function test_unauthenticated_user_cannot_update_profile(): void
    {
        $payload = [
            'first_name' => 'Jane',
        ];

        $response = $this->patchJson('/api/user/profile', $payload, [
            'Accept' => 'application/json',
        ]);

        $response->assertStatus(401);
    }

    public function test_get_authenticated_user_posts(): void
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id, 'restaurant_id' => $restaurant->id, 'status' => OrderStatusEnum::COMPLETED]);

        // Create posts
        $post1 = Post::factory()->create(['user_id' => $user->id, 'order_id' => $order->id, 'restaurant_id' => $restaurant->id, 'created_at' => now()->subDay()]);
        $post2 = Post::factory()->create(['user_id' => $user->id, 'order_id' => $order->id, 'restaurant_id' => $restaurant->id, 'created_at' => now()]);

        // Create another user's post
        $otherUser = User::factory()->create();
        $otherOrder = Order::factory()->create(['user_id' => $otherUser->id, 'restaurant_id' => $restaurant->id, 'status' => OrderStatusEnum::COMPLETED]);
        Post::factory()->create(['user_id' => $otherUser->id, 'order_id' => $otherOrder->id, 'restaurant_id' => $restaurant->id]);

        $response = $this->getJson('/api/user/posts', $this->getHeadersForUser($user));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.items');

        // Check newest to oldest ordering (post2 should be first because it is newer)
        $response->assertJsonPath('data.items.0.id', $post2->id);
        $response->assertJsonPath('data.items.1.id', $post1->id);
    }

    public function test_pagination_works_correctly(): void
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        // Create 25 posts
        for ($i = 0; $i < 25; $i++) {
            $order = Order::factory()->create(['user_id' => $user->id, 'restaurant_id' => $restaurant->id, 'status' => OrderStatusEnum::COMPLETED]);
            Post::factory()->create([
                'user_id'       => $user->id,
                'order_id'      => $order->id,
                'restaurant_id' => $restaurant->id,
                'created_at'    => now()->subMinutes(30 - $i)
            ]);
        }

        $response = $this->getJson('/api/user/posts?per_page=10', $this->getHeadersForUser($user));

        $response->assertOk()
            ->assertJsonCount(10, 'data.items')
            ->assertJsonPath('data.meta.total', 25)
            ->assertJsonPath('data.meta.per_page', 10)
            ->assertJsonPath('data.meta.current_page', 1);
    }

    public function test_get_shareable_orders(): void
    {
        $user = User::factory()->create();
        $restaurant = Restaurant::factory()->create();

        // 1. Completed order (shareable)
        $completedOrder = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::COMPLETED
        ]);

        // 2. Already shared completed order (not shareable)
        $sharedOrder = Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::COMPLETED
        ]);
        Post::factory()->create([
            'user_id' => $user->id,
            'order_id' => $sharedOrder->id,
            'restaurant_id' => $restaurant->id
        ]);

        // 3. Pending order (not shareable)
        Order::factory()->create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => OrderStatusEnum::PENDING
        ]);

        $response = $this->getJson('/api/user/posts/shareable-orders', $this->getHeadersForUser($user));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $completedOrder->id);
    }
}
