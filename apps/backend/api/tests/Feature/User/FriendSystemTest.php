<?php

namespace Tests\Feature\User;

use App\Models\User;
use App\Models\FriendRequest;
use App\Models\Friendship;
use App\Enums\User\FriendRequestStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class FriendSystemTest extends TestCase
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

    public function test_user_can_send_friend_request(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $response = $this->postJson('/api/friends/request', [
            'user_id' => $user2->id
        ], $this->getHeadersForUser($user1));

        $response->assertOk();
        $this->assertDatabaseHas('friend_requests', [
            'requester_id' => $user1->id,
            'addressee_id' => $user2->id,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);
    }

    public function test_user_cannot_send_request_to_self(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/friends/request', [
            'user_id' => $user->id
        ], $this->getHeadersForUser($user));

        $response->assertStatus(500); // throws exception "You cannot send a friend request to yourself."
    }

    public function test_user_can_list_incoming_pending_requests(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        FriendRequest::create([
            'requester_id' => $user2->id,
            'addressee_id' => $user1->id,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);

        $response = $this->getJson('/api/friends/requests', $this->getHeadersForUser($user1));

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.sender_id', $user2->id);
    }

    public function test_user_can_accept_friend_request(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $req = FriendRequest::create([
            'requester_id' => $user2->id,
            'addressee_id' => $user1->id,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);

        $response = $this->postJson("/api/friends/requests/{$req->id}/accept", [], $this->getHeadersForUser($user1));

        $response->assertOk();
        $this->assertDatabaseHas('friend_requests', [
            'id'     => $req->id,
            'status' => FriendRequestStatusEnum::ACCEPTED->value,
        ]);

        $lowId = min($user1->id, $user2->id);
        $highId = max($user1->id, $user2->id);
        $this->assertDatabaseHas('friendships', [
            'user_low_id'  => $lowId,
            'user_high_id' => $highId,
        ]);
    }

    public function test_user_can_reject_friend_request(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $req = FriendRequest::create([
            'requester_id' => $user2->id,
            'addressee_id' => $user1->id,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);

        $response = $this->postJson("/api/friends/requests/{$req->id}/reject", [], $this->getHeadersForUser($user1));

        $response->assertOk();
        $this->assertDatabaseHas('friend_requests', [
            'id'     => $req->id,
            'status' => FriendRequestStatusEnum::REJECTED->value,
        ]);
    }

    public function test_user_can_cancel_outgoing_request(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $req = FriendRequest::create([
            'requester_id' => $user1->id,
            'addressee_id' => $user2->id,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);

        $response = $this->deleteJson("/api/friends/requests/{$req->id}", [], $this->getHeadersForUser($user1));

        $response->assertOk();
        $this->assertDatabaseMissing('friend_requests', [
            'id' => $req->id,
        ]);
    }

    public function test_user_can_list_friends(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $lowId = min($user1->id, $user2->id);
        $highId = max($user1->id, $user2->id);

        Friendship::create([
            'user_low_id'  => $lowId,
            'user_high_id' => $highId,
        ]);

        $response = $this->getJson('/api/friends', $this->getHeadersForUser($user1));

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $user2->id);
    }

    public function test_user_can_remove_friendship(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $lowId = min($user1->id, $user2->id);
        $highId = max($user1->id, $user2->id);

        $friendship = Friendship::create([
            'user_low_id'  => $lowId,
            'user_high_id' => $highId,
        ]);

        $response = $this->deleteJson("/api/friends/{$user2->id}", [], $this->getHeadersForUser($user1));

        $response->assertOk();
        $this->assertDatabaseMissing('friendships', [
            'id' => $friendship->id,
        ]);
    }
    public function test_user_can_list_sent_pending_requests(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        FriendRequest::create([
            'requester_id' => $user1->id,
            'addressee_id' => $user2->id,
            'status'       => FriendRequestStatusEnum::PENDING->value,
        ]);

        $response = $this->getJson('/api/friends/requests/sent', $this->getHeadersForUser($user1));

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.recipient_id', $user2->id);
    }

    public function test_user_can_search_users_globally(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create(['username' => 'searchableuser']);
        $user3 = User::factory()->create(['first_name' => 'Searchable', 'last_name' => 'Name']);

        $response = $this->getJson('/api/users/search?search=searchable', $this->getHeadersForUser($user1));

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }
}
