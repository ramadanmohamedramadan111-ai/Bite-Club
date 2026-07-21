<?php

namespace Tests\Feature\Social;

use App\Models\Admin;
use App\Models\Post;
use App\Enums\Social\PostStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AdminPostModerationTest extends TestCase
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

    public function test_admin_can_approve_post(): void
    {
        $admin = Admin::factory()->create();
        $post = Post::factory()->create([
            'status' => PostStatusEnum::PENDING->value,
        ]);

        $response = $this->postJson("/api/admin/posts/{$post->id}/approve", [], $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $response->assertJsonPath('data.status', PostStatusEnum::APPROVED->value);

        $this->assertDatabaseHas('posts', [
            'id'          => $post->id,
            'status'      => PostStatusEnum::APPROVED->value,
            'reviewed_by' => $admin->id,
        ]);

        $post->refresh();
        $this->assertNotNull($post->published_at);
        $this->assertNotNull($post->expires_at);
        $this->assertEquals(7, (int) round($post->published_at->diffInDays($post->expires_at)));
    }

    public function test_admin_can_reject_post(): void
    {
        $admin = Admin::factory()->create();
        $post = Post::factory()->create([
            'status' => PostStatusEnum::PENDING->value,
        ]);

        $response = $this->postJson("/api/admin/posts/{$post->id}/reject", [
            'rejection_reason' => 'Violates community guidelines.',
        ], $this->getHeadersForAdmin($admin));

        $response->assertOk();
        $response->assertJsonPath('data.status', PostStatusEnum::REJECTED->value);

        $this->assertDatabaseHas('posts', [
            'id'               => $post->id,
            'status'           => PostStatusEnum::REJECTED->value,
            'reviewed_by'      => $admin->id,
            'rejection_reason' => 'Violates community guidelines.',
        ]);
    }
}
