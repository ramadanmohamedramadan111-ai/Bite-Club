<?php

namespace Tests\Feature\User\Restaurant;

use App\Models\User;
use App\Models\Restaurant;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ShowTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_view_active_open_restaurant()
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

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        
        $response->assertJsonStructure([
            'data' => [
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
        ]);
        
        $response->assertJsonPath('data.id', $restaurant->id);
    }

    public function test_user_cannot_view_closed_restaurant()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update(['is_open' => false]);

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}");

        $response->assertStatus(404);
        $response->assertJsonPath('message', trans('restaurant.not_found'));
    }

    public function test_user_cannot_view_inactive_restaurant()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::SUSPENDED->value]);
        $restaurant->setting()->update(['is_open' => true]);

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}");

        $response->assertStatus(404);
        $response->assertJsonPath('message', trans('restaurant.not_found'));
    }

    public function test_returns_404_if_not_found()
    {
        [$user, $token] = $this->loginUser();

        $response = $this->withToken($token)->getJson('/api/user/restaurants/99999');

        $response->assertStatus(404);
        $response->assertJsonPath('message', trans('restaurant.not_found'));
    }
}
