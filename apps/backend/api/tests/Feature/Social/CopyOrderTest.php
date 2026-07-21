<?php

namespace Tests\Feature\Social;

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Post;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Social\PostStatusEnum;
use App\Enums\Social\OrderCopyStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class CopyOrderTest extends TestCase
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

    public function test_user_can_copy_order_from_approved_post_into_new_cart(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $originalOrder = Order::factory()->create([
            'user_id' => $user1->id,
            'status'  => OrderStatusEnum::COMPLETED->value,
        ]);

        $item = MenuItem::factory()->create();
        OrderItem::create([
            'order_id'  => $originalOrder->id,
            'item_id'   => $item->id,
            'item_name' => 'Tasty Burger',
            'quantity'  => 2,
            'price'     => 15.00,
        ]);

        $post = Post::factory()->approved()->create([
            'user_id'    => $user1->id,
            'order_id'   => $originalOrder->id,
            'copy_count' => 0,
        ]);

        $response = $this->postJson("/api/posts/{$post->id}/copy", [], $this->getHeadersForUser($user2));

        $response->assertStatus(201);
        $response->assertJsonPath('data.status', OrderCopyStatusEnum::PENDING->value);

        $cartId = $response->json('data.cart_id');

        $this->assertDatabaseHas('carts', [
            'id'            => $cartId,
            'user_id'       => $user2->id,
            'restaurant_id' => $originalOrder->restaurant_id,
        ]);

        $this->assertDatabaseHas('cart_items', [
            'cart_id'   => $cartId,
            'item_id'   => $item->id,
            'item_name' => 'Tasty Burger',
            'quantity'  => 2,
        ]);

        $this->assertDatabaseHas('order_copies', [
            'post_id'           => $post->id,
            'original_order_id' => $originalOrder->id,
            'copied_by_user_id' => $user2->id,
            'status'            => OrderCopyStatusEnum::PENDING->value,
        ]);
    }

    public function test_completing_copied_order_increments_copy_count(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $originalOrder = Order::factory()->create(['user_id' => $user1->id, 'status' => OrderStatusEnum::COMPLETED->value]);
        $post = Post::factory()->approved()->create(['user_id' => $user1->id, 'order_id' => $originalOrder->id, 'copy_count' => 0]);

        $copyResponse = $this->postJson("/api/posts/{$post->id}/copy", [], $this->getHeadersForUser($user2));
        $copyId = $copyResponse->json('data.copy_id');

        // Create new checkout order for user2
        $newOrder = Order::factory()->create(['user_id' => $user2->id, 'status' => OrderStatusEnum::PENDING->value]);

        $completeResponse = $this->postJson("/api/posts/copies/{$newOrder->id}/complete", [], $this->getHeadersForUser($user2));

        $completeResponse->assertOk();
        $completeResponse->assertJsonPath('data.status', OrderCopyStatusEnum::COMPLETED->value);

        $this->assertDatabaseHas('order_copies', [
            'id'              => $copyId,
            'copied_order_id' => $newOrder->id,
            'status'          => OrderCopyStatusEnum::COMPLETED->value,
        ]);

        $this->assertDatabaseHas('posts', [
            'id'         => $post->id,
            'copy_count' => 1,
        ]);
    }

    public function test_user_cannot_copy_pending_rejected_or_expired_posts(): void
    {
        $user = User::factory()->create();

        $pendingPost = Post::factory()->create(['status' => PostStatusEnum::PENDING->value]);
        $rejectedPost = Post::factory()->rejected()->create();
        $expiredPost = Post::factory()->expired()->create();

        $this->postJson("/api/posts/{$pendingPost->id}/copy", [], $this->getHeadersForUser($user))->assertStatus(400);
        $this->postJson("/api/posts/{$rejectedPost->id}/copy", [], $this->getHeadersForUser($user))->assertStatus(400);
        $this->postJson("/api/posts/{$expiredPost->id}/copy", [], $this->getHeadersForUser($user))->assertStatus(400);
    }
}
