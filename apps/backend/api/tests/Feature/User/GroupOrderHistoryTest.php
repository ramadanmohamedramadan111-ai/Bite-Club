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

class GroupOrderHistoryTest extends TestCase
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
        $response = $this->getJson('/api/user/group-orders/history');
        $response->assertStatus(401);
    }

    public function test_it_returns_only_past_group_orders_for_user_paginated()
    {
        // Completed group order where user is host (should be returned)
        $completedOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
        ]);

        // Cancelled group order where user is host (should be returned)
        $cancelledOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::CANCELLED->value,
        ]);

        // Open group order (should not be returned)
        GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        // Other user's past group order where our user is NOT involved (should not be returned)
        $otherUser = User::factory()->create();
        $otherGroup = Group::factory()->create(['owner_user_id' => $otherUser->id]);
        GroupOrder::create([
            'group_id' => $otherGroup->id,
            'host_id' => $otherUser->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/group-orders/history');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        // Assert pagination meta exists
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'items' => [
                    '*' => ['id', 'status', 'restaurant', 'host', 'total_amount', 'members_summary']
                ],
                'meta' => ['current_page', 'last_page', 'total']
            ]
        ]);

        $this->assertEquals(2, $response->json('data.meta.total'));
        
        $statuses = collect($response->json('data.items'))->pluck('status')->toArray();
        $this->assertContains(GroupOrderStatusEnum::COMPLETED->value, $statuses);
        $this->assertContains(GroupOrderStatusEnum::CANCELLED->value, $statuses);
        $this->assertNotContains(GroupOrderStatusEnum::OPEN->value, $statuses);
    }

    public function test_it_filters_group_orders_history_by_group_id()
    {
        // Group 1 completed order
        GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
        ]);

        // Group 2 completed order for same host
        $group2 = Group::factory()->create(['owner_user_id' => $this->user->id]);
        GroupOrder::create([
            'group_id' => $group2->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
        ]);

        // Filter by Group 1
        $responseGroup1 = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/group-orders/history?group_id=' . $this->group->id);

        $responseGroup1->assertStatus(200);
        $this->assertEquals(1, $responseGroup1->json('data.meta.total'));

        // Filter by Group 2
        $responseGroup2 = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->getJson('/api/user/group-orders/history?group_id=' . $group2->id);

        $responseGroup2->assertStatus(200);
        $this->assertEquals(1, $responseGroup2->json('data.meta.total'));
    }

    public function test_it_includes_group_order_where_user_ordered_item_even_if_not_host()
    {
        $host = User::factory()->create();
        $group = Group::factory()->create(['owner_user_id' => $host->id]);
        
        $groupOrder = GroupOrder::create([
            'group_id' => $group->id,
            'host_id' => $host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::COMPLETED->value,
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
        ])->getJson('/api/user/group-orders/history');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.meta.total'));
    }
}
