<?php

namespace Tests\Feature\User;

use App\Enums\GroupOrder\GroupOrderStatusEnum;
use App\Models\Group;
use App\Models\GroupOrder;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class CancelGroupOrderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Restaurant $restaurant;
    private Group $group;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->restaurant = Restaurant::factory()->create();
        $this->group = Group::factory()->create(['owner_user_id' => $this->user->id]);
        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_it_returns_unauthorized_if_no_token()
    {
        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        $response = $this->postJson("/api/user/group-orders/{$groupOrder->id}/cancel");
        $response->assertStatus(401);
    }

    public function test_host_can_cancel_open_group_order()
    {
        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->postJson("/api/user/group-orders/{$groupOrder->id}/cancel");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $this->assertDatabaseHas('group_orders', [
            'id' => $groupOrder->id,
            'status' => GroupOrderStatusEnum::CANCELLED->value,
        ]);
    }

    public function test_host_can_cancel_locked_group_order()
    {
        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::LOCKED->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->postJson("/api/user/group-orders/{$groupOrder->id}/cancel");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $this->assertDatabaseHas('group_orders', [
            'id' => $groupOrder->id,
            'status' => GroupOrderStatusEnum::CANCELLED->value,
        ]);
    }

    public function test_non_host_cannot_cancel_group_order()
    {
        $otherUser = User::factory()->create();
        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $otherUser->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->postJson("/api/user/group-orders/{$groupOrder->id}/cancel");

        $response->assertStatus(400)
                 ->assertJsonPath('success', false);

        $this->assertDatabaseHas('group_orders', [
            'id' => $groupOrder->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);
    }

    public function test_host_cannot_cancel_completed_group_order()
    {
        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->postJson("/api/user/group-orders/{$groupOrder->id}/cancel");

        $response->assertStatus(400)
                 ->assertJsonPath('success', false);

        $this->assertDatabaseHas('group_orders', [
            'id' => $groupOrder->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
        ]);
    }
}
