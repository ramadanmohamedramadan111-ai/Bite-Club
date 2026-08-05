<?php

namespace Tests\Feature\User;

use App\Enums\GroupOrder\GroupOrderStatusEnum;
use App\Events\GroupOrderItemAdded;
use App\Events\GroupOrderItemQuantityUpdated;
use App\Events\GroupOrderItemRemoved;
use App\Events\GroupOrderUserItemsCleared;
use App\Models\Group;
use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Models\GroupOrderItemGuest;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class GroupOrderGuestTest extends TestCase
{
    use RefreshDatabase;

    private User $host;
    private Restaurant $restaurant;
    private Group $group;
    private string $hostToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->host = User::factory()->create();
        $this->restaurant = Restaurant::factory()->create();
        
        $this->group = Group::create([
            'owner_user_id' => $this->host->id,
            'name' => 'Test Group',
            'invite_token' => 'test-token',
            'allow_guests_for_orders' => true,
        ]);
        
        // Host needs to be a member of the group
        $this->group->members()->attach($this->host->id, [
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        $this->hostToken = JWTAuth::fromUser($this->host);
    }

    public function test_group_order_creation_copies_allow_guests_for_orders()
    {
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->hostToken}",
            'Accept' => 'application/json',
        ])->postJson("/api/user/group-orders", [
            'group_id' => $this->group->id,
            'restaurant_id' => $this->restaurant->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('group_orders', [
            'group_id' => $this->group->id,
            'allow_guests' => true,
        ]);
    }

    public function test_guest_can_add_item_to_group_order()
    {
        Event::fake();

        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
            'allow_guests' => true,
        ]);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Drinks',
        ]);

        $menuItem = MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Cola',
            'price' => 15.50,
            'availability' => 'available',
        ]);

        $response = $this->postJson("/api/user/group-orders/{$groupOrder->id}/guest/items", [
            'user_id' => 'guest-uuid-123',
            'user_name' => 'John Doe',
            'item_id' => $menuItem->id,
            'quantity' => 2,
            'notes' => 'Cold please',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('success', true);

        $this->assertDatabaseHas('group_order_items_guest', [
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
            'user_name' => 'John Doe',
            'item_id' => $menuItem->id,
            'quantity' => 2,
            'notes' => 'Cold please',
        ]);

        Event::assertDispatched(GroupOrderItemAdded::class);
    }

    public function test_guest_can_update_item_quantity()
    {
        Event::fake();

        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
            'allow_guests' => true,
        ]);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Drinks',
        ]);

        $menuItem = MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Cola',
            'price' => 15.50,
            'availability' => 'available',
        ]);

        $guestItem = GroupOrderItemGuest::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
            'user_name' => 'John Doe',
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 2,
            'unit_price' => $menuItem->price,
        ]);

        $response = $this->putJson("/api/user/group-orders/{$groupOrder->id}/guest/items/{$guestItem->id}", [
            'user_id' => 'guest-uuid-123',
            'quantity' => 5,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('group_order_items_guest', [
            'id' => $guestItem->id,
            'quantity' => 5,
        ]);

        Event::assertDispatched(GroupOrderItemQuantityUpdated::class);
    }

    public function test_guest_can_remove_item()
    {
        Event::fake();

        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
            'allow_guests' => true,
        ]);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Drinks',
        ]);

        $menuItem = MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Cola',
            'price' => 15.50,
            'availability' => 'available',
        ]);

        $guestItem = GroupOrderItemGuest::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
            'user_name' => 'John Doe',
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 2,
            'unit_price' => $menuItem->price,
        ]);

        $response = $this->deleteJson("/api/user/group-orders/{$groupOrder->id}/guest/items/{$guestItem->id}", [
            'user_id' => 'guest-uuid-123',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('group_order_items_guest', [
            'id' => $guestItem->id,
        ]);

        Event::assertDispatched(GroupOrderItemRemoved::class);
    }

    public function test_guest_can_clear_items()
    {
        Event::fake();

        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
            'allow_guests' => true,
        ]);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Drinks',
        ]);

        $menuItem = MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Cola',
            'price' => 15.50,
            'availability' => 'available',
        ]);

        GroupOrderItemGuest::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
            'user_name' => 'John Doe',
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 2,
            'unit_price' => $menuItem->price,
        ]);

        $response = $this->deleteJson("/api/user/group-orders/{$groupOrder->id}/guest/items", [
            'user_id' => 'guest-uuid-123',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('group_order_items_guest', [
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
        ]);

        Event::assertDispatched(GroupOrderUserItemsCleared::class);
    }

    public function test_guest_can_view_group_cart()
    {
        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
            'allow_guests' => true,
        ]);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Drinks',
        ]);

        $menuItem = MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Cola',
            'price' => 15.00,
            'availability' => 'available',
        ]);

        GroupOrderItemGuest::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
            'user_name' => 'John Doe',
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 2,
            'unit_price' => $menuItem->price,
        ]);

        $response = $this->getJson("/api/user/group-orders/{$groupOrder->id}/guest/cart");

        $response->assertStatus(200)
                 ->assertJsonPath('data.total_amount', 30.00);
    }

    public function test_user_can_merge_guest_items()
    {
        Event::fake();

        $groupOrder = GroupOrder::create([
            'group_id' => $this->group->id,
            'host_id' => $this->host->id,
            'restaurant_id' => $this->restaurant->id,
            'status' => GroupOrderStatusEnum::OPEN->value,
            'allow_guests' => true,
        ]);

        $category = MenuCategory::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'Drinks',
        ]);

        $menuItem = MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Cola',
            'price' => 15.00,
            'availability' => 'available',
        ]);

        GroupOrderItemGuest::create([
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
            'user_name' => 'John Doe',
            'item_id' => $menuItem->id,
            'item_name' => $menuItem->title,
            'quantity' => 2,
            'unit_price' => $menuItem->price,
            'notes' => 'cold',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->hostToken}",
            'Accept' => 'application/json',
        ])->postJson("/api/user/group-orders/{$groupOrder->id}/guest/merge", [
            'guest_user_id' => 'guest-uuid-123',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('group_order_items_guest', [
            'group_order_id' => $groupOrder->id,
            'user_id' => 'guest-uuid-123',
        ]);

        $this->assertDatabaseHas('group_order_items', [
            'group_order_id' => $groupOrder->id,
            'user_id' => $this->host->id,
            'item_id' => $menuItem->id,
            'quantity' => 2,
            'notes' => 'cold',
        ]);

        Event::assertDispatched(GroupOrderUserItemsCleared::class);
    }
}
