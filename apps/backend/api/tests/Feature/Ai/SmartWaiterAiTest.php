<?php

namespace Tests\Feature\Ai;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class SmartWaiterAiTest extends TestCase
{
    use RefreshDatabase;

    protected function createRestaurant(array $attributes = []): Restaurant
    {
        return Restaurant::query()->create(array_merge([
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => Hash::make('password123'),
            'phone_number' => fake()->unique()->numerify('01#########'),
            'address' => fake()->address(),
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ], $attributes));
    }

    private function getHeadersForUser(User $user): array
    {
        $token = JWTAuth::fromUser($user);
        return [
            'Authorization' => "Bearer {$token}",
            'Accept'        => 'application/json',
        ];
    }

    public function test_smart_waiter_chat_requires_user_auth(): void
    {
        $response = $this->postJson('/api/ai/smart-waiter/chat', [
            'message' => 'Hello',
        ]);

        $response->assertStatus(401);
    }

    public function test_smart_waiter_chat_with_user_token_and_minimal_message(): void
    {
        $user = User::factory()->create();
        $restaurant = $this->createRestaurant();

        config(['services.ai.internal_api_key' => 'test_key']);
        config(['services.ai.service_url' => 'http://ai-service']);

        Http::fake([
            'http://ai-service/api/v1/smart-waiter/chat/' => Http::response([
                'reply' => 'Here are great options for your 100 EGP budget!',
                'total_price' => 95.00,
                'items' => [
                    [
                        'id' => 1,
                        'name' => 'Spicy Chicken Wrap',
                        'price' => 75.00,
                        'quantity' => 1,
                        'why' => 'Fits your budget and satisfies your preference for spicy food.'
                    ]
                ]
            ], 200),
        ]);

        $response = $this->withHeaders($this->getHeadersForUser($user))->postJson('/api/ai/smart-waiter/chat', [
            'message' => 'I have 100 EGP, what should I order?',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'reply',
                'total_price',
                'items' => [
                    '*' => ['id', 'name', 'price', 'quantity', 'why']
                ]
            ]
        ]);
        $response->assertJsonPath('data.reply', 'Here are great options for your 100 EGP budget!');
    }

    public function test_internal_tools_user_history_successful(): void
    {
        $restaurant = $this->createRestaurant();
        config(['services.ai.internal_api_key' => 'secure_key']);

        $response = $this->postJson('/api/internal/ai/tools/user-history', [
            'restaurant_id' => $restaurant->id,
            'user_id' => 123
        ], [
            'X-Internal-API-Key' => 'secure_key'
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'restaurant_id',
            'user_id',
            'total_orders',
            'past_items'
        ]);
    }

    public function test_seeder_user_can_login_and_chat(): void
    {
        $this->seed(\Database\Seeders\SmartWaiterTestUserSeeder::class);

        $loginResponse = $this->postJson('/api/user/login', [
            'email' => 'testuser@biteclub.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertOk();
        $token = $loginResponse->json('data.access_token');
        $this->assertNotEmpty($token);

        config(['services.ai.internal_api_key' => 'test_key']);
        config(['services.ai.service_url' => 'http://ai-service']);

        Http::fake([
            'http://ai-service/api/v1/smart-waiter/chat/' => Http::response([
                'reply' => 'Recommended wrap and lemonade based on your past orders!',
                'total_price' => 95.00,
                'items' => [],
            ], 200),
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/json',
        ])->postJson('/api/ai/smart-waiter/chat', [
            'message' => 'Recommend based on my previous orders.',
        ]);

        $response->assertOk();
    }

    public function test_smart_waiter_chat_auto_adds_items_to_cart(): void
    {
        $user = User::factory()->create();
        $restaurant = $this->createRestaurant();
        $category = \App\Models\MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'title' => 'Burgers',
            'icon_name' => 'fast-food',
            'short_description' => 'Burgers',
            'visibility' => 'visible',
        ]);
        $item = \App\Models\MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Spicy Chicken Wrap',
            'price' => 75.00,
            'description' => 'Spicy Wrap',
            'image_url' => 'default.jpg',
            'availability' => 'available',
        ]);

        config(['services.ai.internal_api_key' => 'test_key']);
        config(['services.ai.service_url' => 'http://ai-service']);

        Http::fake([
            'http://ai-service/api/v1/smart-waiter/chat/' => Http::response([
                'reply' => 'Adding spicy wrap to your cart!',
                'total_price' => 75.00,
                'items' => [
                    [
                        'id' => $item->id,
                        'name' => $item->title,
                        'price' => 75.00,
                        'quantity' => 1,
                        'why' => 'Requested by user.'
                    ]
                ]
            ], 200),
        ]);

        $response = $this->withHeaders($this->getHeadersForUser($user))->postJson('/api/ai/smart-waiter/add-to-cart', [
            'restaurant_id' => $restaurant->id,
            'items' => [
                ['id' => $item->id, 'quantity' => 1]
            ]
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.cart_updated', true);
        $response->assertJsonPath('data.cart_item_count', 1);

        $this->assertDatabaseHas('cart_items', [
            'item_id' => $item->id,
            'quantity' => 1,
        ]);
    }

    public function test_smart_waiter_dedicated_add_to_cart_endpoint(): void
    {
        $user = User::factory()->create();
        $restaurant = $this->createRestaurant();
        $category = \App\Models\MenuCategory::create([
            'restaurant_id' => $restaurant->id,
            'title' => 'Burgers',
            'icon_name' => 'fast-food',
            'short_description' => 'Burgers',
            'visibility' => 'visible',
        ]);
        $item = \App\Models\MenuItem::create([
            'menu_category_id' => $category->id,
            'title' => 'Spicy Chicken Wrap',
            'price' => 75.00,
            'description' => 'Spicy Wrap',
            'image_url' => 'default.jpg',
            'availability' => 'available',
        ]);

        $response = $this->withHeaders($this->getHeadersForUser($user))->postJson('/api/ai/smart-waiter/add-to-cart', [
            'restaurant_id' => $restaurant->id,
            'items' => [
                ['id' => $item->id, 'quantity' => 1]
            ]
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.cart_updated', true);
        $response->assertJsonPath('data.cart_item_count', 1);

        $this->assertDatabaseHas('cart_items', [
            'item_id' => $item->id,
            'quantity' => 1,
        ]);
    }
}


