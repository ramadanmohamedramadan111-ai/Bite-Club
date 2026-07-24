<?php

namespace Tests\Feature\Social;

use App\Models\User;
use App\Models\Post;
use App\Models\OrderCopy;
use App\Enums\Social\OrderCopyStatusEnum;
use App\Services\Application\Social\LeaderboardApplicationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class LeaderboardTest extends TestCase
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

    public function test_leaderboard_generation_ranks_creators_by_completed_copies(): void
    {
        $creator1 = User::factory()->create();
        $creator2 = User::factory()->create();

        $post1 = Post::factory()->approved()->create(['user_id' => $creator1->id]);
        $post2 = Post::factory()->approved()->create(['user_id' => $creator2->id]);

        // Creator1 has 3 completed copies
        OrderCopy::factory()->completed()->count(3)->create([
            'post_id'      => $post1->id,
            'completed_at' => now(),
        ]);

        // Creator2 has 1 completed copy
        OrderCopy::factory()->completed()->count(1)->create([
            'post_id'      => $post2->id,
            'completed_at' => now(),
        ]);

        $leaderboardService = app(LeaderboardApplicationService::class);
        $leaderboardService->generateWeeklyLeaderboard();

        $this->assertDatabaseHas('leaderboards', [
            'user_id'       => $creator1->id,
            'rank'          => 1,
            'copies'        => 3,
            'reward_points' => 2000,
        ]);

        $this->assertDatabaseHas('leaderboards', [
            'user_id'       => $creator2->id,
            'rank'          => 2,
            'copies'        => 1,
            'reward_points' => 1000,
        ]);

        // Assert wallets were updated
        $this->assertEquals(2000, $creator1->wallet->fresh()->balance);
        $this->assertEquals(1000, $creator2->wallet->fresh()->balance);

        $response = $this->getJson('/api/leaderboards?type=weekly', $this->getHeadersForUser($creator1));

        $response->assertOk();
        $response->assertJsonCount(2, 'data.items');
        $response->assertJsonPath('data.items.0.user.id', $creator1->id);
        $response->assertJsonPath('data.items.0.rank', 1);
        $response->assertJsonPath('data.items.1.user.id', $creator2->id);
        $response->assertJsonPath('data.items.1.rank', 2);
    }
}
