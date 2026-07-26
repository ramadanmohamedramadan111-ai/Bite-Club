<?php

namespace Tests\Feature\User;

use App\Enums\GroupOrder\GroupOrderStatusEnum;
use App\Models\Group;
use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ActiveGroupOrdersTest extends TestCase
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
        $response = $this->getJson('/api/user/group-orders/active-sessions');
        $response->assertStatus(401);
    }

    public function test_it_returns_only_active_group_orders_for_user()
    {
        // Open group order where user is host (should be returned)
        GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        // Locked group order where user is host (should be returned)
        GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::LOCKED->value,
        ]);

        // Completed group order (should not be returned)
        GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
        ]);

        // Other user's open group order where our user is NOT involved (should not be returned)
        $otherUser = User::factory()->create();
        $otherGroup = Group::factory()->create(['owner_user_id' => $otherUser->id]);
        GroupOrder::create([
            'group_id' => $otherGroup->id,
            'host_id' => $otherUser->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/group-orders/active-sessions');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         '*' => ['id', 'status', 'group_id', 'group_name', 'restaurant_id', 'restaurant_name']
                     ]
                 ]);

        $this->assertCount(2, $response->json('data'));
        
        $statuses = collect($response->json('data'))->pluck('status')->toArray();
        $this->assertContains(GroupOrderStatusEnum::OPEN->value, $statuses);
        $this->assertContains(GroupOrderStatusEnum::LOCKED->value, $statuses);
        $this->assertNotContains(GroupOrderStatusEnum::COMPLETED->value, $statuses);
    }

    public function test_it_includes_active_group_order_where_user_ordered_item_even_if_not_host()
    {
        $host = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $host->id]);
        
        $groupOrder = GroupOrder::create([
            'group_id' => $group->id,
            'host_id' => $host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        $menuItem = MenuItem::factory()->create();

        GroupOrderItem::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => $this->user->id,
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 2,
            'unit_price' => 15.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/group-orders/active-sessions');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }
}
