<?php

namespace Tests\Feature\Social;

use App\Models\User;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class PostExpirationTest extends TestCase
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

    public function test_posts_expire_after_7_days(): void
    {
        $user = User::factory()->create();

        $activePost = Post::factory()->approved()->create([
            'published_at' => now()->subDays(2),
            'expires_at'   => now()->addDays(5),
        ]);

        $expiredPost = Post::factory()->approved()->create([
            'published_at' => now()->subDays(8),
            'expires_at'   => now()->subDay(),
        ]);

        $feedResponse = $this->getJson('/api/posts', $this->getHeadersForUser($user));
        $feedResponse->assertOk();
        $feedResponse->assertJsonCount(1, 'data.items');
        $feedResponse->assertJsonPath('data.items.0.id', $activePost->id);

        $likeExpired = $this->postJson("/api/posts/{$expiredPost->id}/like", [], $this->getHeadersForUser($user));
        $likeExpired->assertStatus(400);

        $copyExpired = $this->postJson("/api/posts/{$expiredPost->id}/copy", [], $this->getHeadersForUser($user));
        $copyExpired->assertStatus(400);
    }
}
