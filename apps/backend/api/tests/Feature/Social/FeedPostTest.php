<?php

namespace Tests\Feature\Social;

use App\Models\User;
use App\Models\Post;
use App\Models\PostLike;
use App\Enums\Social\PostStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class FeedPostTest extends TestCase
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

    public function test_user_can_browse_feed(): void
    {
        $user = User::factory()->create();

        $post1 = Post::factory()->approved()->create([
            'caption'      => 'Older post',
            'published_at' => now()->subHours(5),
            'expires_at'   => now()->addDays(6),
        ]);

        $post2 = Post::factory()->approved()->create([
            'caption'      => 'Newer post',
            'published_at' => now()->subHour(),
            'expires_at'   => now()->addDays(7),
        ]);

        PostLike::factory()->create([
            'post_id' => $post2->id,
            'user_id' => $user->id,
        ]);

        $response = $this->getJson('/api/posts', $this->getHeadersForUser($user));

        $response->assertOk();
        $response->assertJsonCount(2, 'data.items');

        // Newest published post first
        $response->assertJsonPath('data.items.0.id', $post2->id);
        $response->assertJsonPath('data.items.0.is_liked_by_user', true);
        $response->assertJsonPath('data.items.1.id', $post1->id);
        $response->assertJsonPath('data.items.1.is_liked_by_user', false);
    }

    public function test_feed_hides_pending_rejected_and_expired_posts(): void
    {
        $user = User::factory()->create();

        Post::factory()->create(['status' => PostStatusEnum::PENDING->value]);
        Post::factory()->rejected()->create();
        Post::factory()->expired()->create();

        $approvedPost = Post::factory()->approved()->create();

        $response = $this->getJson('/api/posts', $this->getHeadersForUser($user));

        $response->assertOk();
        $response->assertJsonCount(1, 'data.items');
        $response->assertJsonPath('data.items.0.id', $approvedPost->id);
    }
}
