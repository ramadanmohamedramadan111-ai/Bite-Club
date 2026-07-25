<?php

namespace Tests\Feature\Ai;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AiChatTest extends TestCase
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

    protected function loginRestaurant(array $attributes = []): array
    {
        $restaurant = $this->createRestaurant($attributes);

        $response = $this->postJson('/api/restaurant/login', [
            'email' => $restaurant->email,
            'password' => 'password123',
        ]);

        $response->assertOk();

        return [$restaurant->fresh(), $response->json('data.access_token')];
    }

    public function test_chat_requires_restaurant_auth(): void
    {
        $response = $this->postJson('/api/ai/chat', [
            'message' => 'Hello',
        ]);

        $response->assertStatus(401);
    }

    public function test_chat_successful_proxy(): void
    {
        [$restaurant, $token] = $this->loginRestaurant();

        config(['services.ai.internal_api_key' => 'test_key']);
        config(['services.ai.service_url' => 'http://ai-service']);

        Http::fake([
            'http://ai-service/api/v1/chat/*' => Http::response([
                'message' => 'Hello owner!',
                'conversation_id' => '123',
                'tool_results' => [],
            ], 200),
        ]);

        $response = $this->withToken($token)->postJson('/api/ai/chat', [
            'message' => 'Hello AI',
            'conversation_id' => '123',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.message', 'Hello owner!');
    }

    public function test_internal_tools_block_invalid_key(): void
    {
        config(['services.ai.internal_api_key' => 'secure_key']);

        $response = $this->postJson('/api/internal/ai/tools/dashboard', [
            'restaurant_id' => 1
        ], [
            'X-Internal-API-Key' => 'wrong_key'
        ]);

        $response->assertStatus(401);
    }

    public function test_internal_tools_dashboard_successful(): void
    {
        $restaurant = $this->createRestaurant();
        config(['services.ai.internal_api_key' => 'secure_key']);

        $response = $this->postJson('/api/internal/ai/tools/dashboard', [
            'restaurant_id' => $restaurant->id
        ], [
            'X-Internal-API-Key' => 'secure_key'
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'restaurant_id',
            'orders' => ['total', 'today', 'live'],
            'revenue' => ['total', 'today'],
            'reviews' => ['average_rating', 'count']
        ]);
    }

    public function test_internal_tools_menu_successful(): void
    {
        $restaurant = $this->createRestaurant();
        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        MenuItem::factory()->create([
            'menu_category_id' => $category->id,
        ]);

        config(['services.ai.internal_api_key' => 'secure_key']);

        $response = $this->postJson('/api/internal/ai/tools/menu', [
            'restaurant_id' => $restaurant->id
        ], [
            'X-Internal-API-Key' => 'secure_key'
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'restaurant_id',
            'categories' => [
                '*' => [
                    'id',
                    'title',
                    'items' => [
                        '*' => ['id', 'title', 'price']
                    ]
                ]
            ]
        ]);
    }
}
