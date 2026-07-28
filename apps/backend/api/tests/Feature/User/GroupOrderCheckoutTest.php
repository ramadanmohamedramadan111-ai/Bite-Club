<?php

namespace Tests\Feature\User;

use App\Enums\GroupOrder\GroupOrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\GeneralSetting;
use App\Models\Group;
use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class GroupOrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_host_can_preview_checkout_with_same_item_id_and_different_notes()
    {
        $host = User::factory()->create();
        $member = User::factory()->create();
        $token = JWTAuth::fromUser($host);

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update([
            'is_open' => true,
            'accept_orders' => true,
            'pickup_enabled' => true,
        ]);

        GeneralSetting::create([
            'commission_rate' => 10,
            'service_fee_amount' => 5,
        ]);

        $group = Group::factory()->create(['owner_user_id' => $host->id]);

        $menuCategory = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
        $menuItem = MenuItem::factory()->create([
            'menu_category_id' => $menuCategory->id,
            'price' => 50.00,
        ]);

        $groupOrder = GroupOrder::create([
            'group_id' => $group->id,
            'host_id' => $host->id,
            'restaurant_id' => $restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
        ]);

        // Add item 1 by host
        GroupOrderItem::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => $host->id,
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 2,
            'unit_price' => 50.00,
            'notes' => 'No onion',
        ]);

        // Add item 2 by member with same item_id but different notes
        GroupOrderItem::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => $member->id,
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 1,
            'unit_price' => 50.00,
            'notes' => 'Extra cheese',
        ]);

        $payload = [
            'order_type' => OrderTypeEnum::PICKUP->value,
        ];

        $response = $this->withToken($token)->postJson("/api/user/group-orders/{$groupOrder->id}/preview", $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.financials.subtotal', 150); // (2 + 1) * 50
        $response->assertJsonCount(1, 'data.items');
        $response->assertJsonPath('data.items.0.quantity', 3);
        
        // Assert notes were merged cleanly without unique constraint violation
        $this->assertDatabaseHas('cart_items', [
            'item_id' => $menuItem->id,
            'quantity' => 3,
            'notes' => '(2x): No onion | (1x): Extra cheese',
        ]);
    }
}
