<?php

namespace Tests\Feature\User\Restaurant;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ListTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_list_restaurants()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create([
            'status'         => RestaurantStatusEnum::ACTIVE->value,
            'average_rating' => 4.5,
            'reviews_count'  => 100,
        ]);
        
        $restaurant->setting()->update([
            'is_open'          => true,
            'delivery_enabled' => true,
            'pickup_enabled'   => true,
            'accept_orders'    => true,
        ]);

        $response = $this->withToken($token)->getJson('/api/user/restaurants');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertCount(1, $response->json('data.items'));
        
        $response->assertJsonStructure([
            'data' => [
                'items' => [
                    '*' => [
                        'id',
                        'name',
                        'logo_url',
                        'cover_image_url',
                        'average_rating',
                        'reviews_count',
                        'delivery_enabled',
                        'pickup_enabled',
                        'accept_orders',
                        'category_name'
                    ]
                ],
                'meta'
            ]
        ]);
    }

    public function test_list_filters_by_name()
    {
        [$user, $token] = $this->loginUser();

        $r1 = Restaurant::factory()->create(['name' => 'Burger King', 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r1->setting()->update(['is_open' => true]);

        $r2 = Restaurant::factory()->create(['name' => 'Pizza Hut', 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r2->setting()->update(['is_open' => true]);

        $response = $this->withToken($token)->getJson('/api/user/restaurants?name=Burger');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.name', 'Burger King');
    }

    public function test_list_filters_by_min_rating()
    {
        [$user, $token] = $this->loginUser();

        $r1 = Restaurant::factory()->create(['average_rating' => 4.5, 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r1->setting()->update(['is_open' => true]);

        $r2 = Restaurant::factory()->create(['average_rating' => 3.5, 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r2->setting()->update(['is_open' => true]);

        $response = $this->withToken($token)->getJson('/api/user/restaurants?min_rating=4.0');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.average_rating', 4.5);
    }

    public function test_list_filters_by_settings()
    {
        [$user, $token] = $this->loginUser();

        $r1 = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $r1->setting()->update(['is_open' => true, 'delivery_enabled' => true]);

        $r2 = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $r2->setting()->update(['is_open' => true, 'delivery_enabled' => false]);

        $response = $this->withToken($token)->getJson('/api/user/restaurants?delivery_enabled=true');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.id', $r1->id);
    }

    public function test_list_sorts_by_rating()
    {
        [$user, $token] = $this->loginUser();

        $r1 = Restaurant::factory()->create(['average_rating' => 4.0, 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r1->setting()->update(['is_open' => true]);

        $r2 = Restaurant::factory()->create(['average_rating' => 5.0, 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r2->setting()->update(['is_open' => true]);

        $response = $this->withToken($token)->getJson('/api/user/restaurants?sort_by=rating');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.id', $r2->id);
        $response->assertJsonPath('data.items.1.id', $r1->id);
    }

    public function test_list_sorts_by_alphabetical()
    {
        [$user, $token] = $this->loginUser();

        $r1 = Restaurant::factory()->create(['name' => 'Zebra', 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r1->setting()->update(['is_open' => true]);

        $r2 = Restaurant::factory()->create(['name' => 'Apple', 'status' => RestaurantStatusEnum::ACTIVE->value]);
        $r2->setting()->update(['is_open' => true]);

        $response = $this->withToken($token)->getJson('/api/user/restaurants?sort_by=alphabetical');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.id', $r2->id);
        $response->assertJsonPath('data.items.1.id', $r1->id);
    }

    public function test_list_excludes_closed_or_inactive()
    {
        [$user, $token] = $this->loginUser();

        // Closed
        $r1 = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $r1->setting()->update(['is_open' => false]);

        // Suspended
        $r2 = Restaurant::factory()->create(['status' => RestaurantStatusEnum::SUSPENDED->value]);
        $r2->setting()->update(['is_open' => true]);

        $response = $this->withToken($token)->getJson('/api/user/restaurants');

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data.items'));
    }
}
