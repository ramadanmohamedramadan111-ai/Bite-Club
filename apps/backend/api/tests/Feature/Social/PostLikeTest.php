<?php

namespace Tests\Feature\Social;

use App\Models\User;
use App\Models\Post;
use App\Enums\Social\PostStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class PostLikeTest extends TestCase
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

    public function test_user_can_like_and_unlike_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->approved()->create(['likes_count' => 0]);

        $likeResponse = $this->postJson("/api/posts/{$post->id}/like", [], $this->getHeadersForUser($user));

        $likeResponse->assertOk();
        $likeResponse->assertJsonPath('data.likes_count', 1);

        $this->assertDatabaseHas('post_likes', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('posts', [
            'id'          => $post->id,
            'likes_count' => 1,
        ]);

        $unlikeResponse = $this->deleteJson("/api/posts/{$post->id}/like", [], $this->getHeadersForUser($user));

        $unlikeResponse->assertOk();
        $unlikeResponse->assertJsonPath('data.likes_count', 0);

        $this->assertDatabaseMissing('post_likes', [
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('posts', [
            'id'          => $post->id,
            'likes_count' => 0,
        ]);
    }

    public function test_user_cannot_like_same_post_twice(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->approved()->create();

        $this->postJson("/api/posts/{$post->id}/like", [], $this->getHeadersForUser($user))->assertOk();

        $secondLike = $this->postJson("/api/posts/{$post->id}/like", [], $this->getHeadersForUser($user));

        $secondLike->assertStatus(400);
    }

    public function test_user_cannot_like_pending_or_expired_post(): void
    {
        $user = User::factory()->create();
        $pendingPost = Post::factory()->create(['status' => PostStatusEnum::PENDING->value]);
        $expiredPost = Post::factory()->expired()->create();

        $pendingResponse = $this->postJson("/api/posts/{$pendingPost->id}/like", [], $this->getHeadersForUser($user));
        $pendingResponse->assertStatus(400);

        $expiredResponse = $this->postJson("/api/posts/{$expiredPost->id}/like", [], $this->getHeadersForUser($user));
        $expiredResponse->assertStatus(400);
    }
}
