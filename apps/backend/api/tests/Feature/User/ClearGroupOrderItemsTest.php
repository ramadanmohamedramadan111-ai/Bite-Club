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

class ClearGroupOrderItemsTest extends TestCase
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

        $response = $this->deleteJson("/api/user/group-orders/{$groupOrder->id}/items");
        $response->assertStatus(401);
    }

    public function test_user_can_clear_their_own_items_from_group_order_without_affecting_others()
    {
        $otherUser = User::factory()->create();

        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        $menuItem1 = MenuItem::factory()->create();
        $menuItem2 = MenuItem::factory()->create();

        // User's item 1
        $item1 = GroupOrderItem::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => $this->user->id,
            'item_id' => $menuItem1->id,
            'item_name' => $menuItem1->title,
            'quantity' => 2,
            'unit_price' => 10.00,
        ]);

        // User's item 2
        $item2 = GroupOrderItem::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => $this->user->id,
            'item_id' => $menuItem2->id,
            'item_name' => $menuItem2->title,
            'quantity' => 1,
            'unit_price' => 15.00,
        ]);

        // Other user's item
        $otherItem = GroupOrderItem::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => $otherUser->id,
            'item_id' => $menuItem1->id,
            'item_name' => $menuItem1->title,
            'quantity' => 3,
            'unit_price' => 10.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->deleteJson("/api/user/group-orders/{$groupOrder->id}/items");

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        // Verify user's items are deleted
        $this->assertDatabaseMissing('group_order_items', ['id' => $item1->id]);
        $this->assertDatabaseMissing('group_order_items', ['id' => $item2->id]);

        // Verify other user's item still exists
        $this->assertDatabaseHas('group_order_items', ['id' => $otherItem->id]);
    }

    public function test_cannot_clear_items_if_order_is_locked()
    {
        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->user->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::LOCKED->value,
        ]);

        $menuItem = MenuItem::factory()->create();
        $item = GroupOrderItem::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => $this->user->id,
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 1,
            'unit_price' => 10.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ])->deleteJson("/api/user/group-orders/{$groupOrder->id}/items");

        $response->assertStatus(400)
                 ->assertJsonPath('success', false);

        $this->assertDatabaseHas('group_order_items', ['id' => $item->id]);
    }
}
