<?php

namespace Tests\Feature\Social;

use App\Models\User;
use App\Models\Order;
use App\Models\Post;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Social\PostStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class CreatePostTest extends TestCase
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

    public function test_user_can_create_post_from_completed_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status'  => OrderStatusEnum::COMPLETED->value,
        ]);

        $response = $this->postJson('/api/posts', [
            'order_id' => $order->id,
            'caption'  => 'Loved this meal!',
            'images'   => ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
        ], $this->getHeadersForUser($user));

        $response->assertStatus(201);
        $response->assertJsonPath('data.caption', 'Loved this meal!');
        $response->assertJsonPath('data.status', PostStatusEnum::PENDING->value);

        $this->assertDatabaseHas('posts', [
            'user_id'  => $user->id,
            'order_id' => $order->id,
            'status'   => PostStatusEnum::PENDING->value,
        ]);

        $this->assertDatabaseHas('post_images', [
            'image_url' => 'http://example.com/image1.jpg',
            'position'  => 0,
        ]);
    }

    public function test_user_cannot_create_post_from_pending_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status'  => OrderStatusEnum::PENDING->value,
        ]);

        $response = $this->postJson('/api/posts', [
            'order_id' => $order->id,
            'caption'  => 'Pending order post attempt',
            'images'   => ['http://example.com/image.jpg'],
        ], $this->getHeadersForUser($user));

        $response->assertStatus(400);
        $this->assertDatabaseMissing('posts', [
            'order_id' => $order->id,
        ]);
    }

    public function test_user_cannot_create_post_from_another_users_order(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user2->id,
            'status'  => OrderStatusEnum::COMPLETED->value,
        ]);

        $response = $this->postJson('/api/posts', [
            'order_id' => $order->id,
            'caption'  => 'Hacking someone elses order',
            'images'   => ['http://example.com/image.jpg'],
        ], $this->getHeadersForUser($user1));

        $response->assertStatus(400);
    }

    public function test_user_cannot_create_multiple_posts_for_same_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status'  => OrderStatusEnum::COMPLETED->value,
        ]);

        $this->postJson('/api/posts', [
            'order_id' => $order->id,
            'caption'  => 'First share',
            'images'   => ['http://example.com/image.jpg'],
        ], $this->getHeadersForUser($user))->assertStatus(201);

        $secondResponse = $this->postJson('/api/posts', [
            'order_id' => $order->id,
            'caption'  => 'Duplicate share attempt',
            'images'   => ['http://example.com/image.jpg'],
        ], $this->getHeadersForUser($user));

        $secondResponse->assertStatus(400);
    }
}
