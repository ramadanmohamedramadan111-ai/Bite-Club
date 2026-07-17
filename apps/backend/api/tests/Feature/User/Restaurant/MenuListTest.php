<?php

namespace Tests\Feature\User\Restaurant;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class MenuListTest extends TestCase
{
    use RefreshDatabase;

    private function loginUser(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);
        return [$user, $token];
    }

    public function test_user_can_list_restaurant_menu()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update(['is_open' => true]);

        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'visibility'    => MenuCategoryVisibilityEnum::VISIBLE->value,
        ]);

        MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
        ]);

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/menu");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertCount(1, $response->json('data.items'));
        
        $response->assertJsonStructure([
            'data' => [
                'items' => [
                    '*' => [
                        'id',
                        'title',
                        'items_count',
                        'items' => [
                            '*' => [
                                'id',
                                'title',
                                'description',
                                'price',
                                'is_available',
                                'image_url'
                            ]
                        ]
                    ]
                ],
                'meta'
            ]
        ]);
    }

    public function test_menu_filters_by_item_title()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update(['is_open' => true]);

        $category = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'visibility'    => MenuCategoryVisibilityEnum::VISIBLE->value,
        ]);

        MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'title'            => 'Pizza Margherita',
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
        ]);

        MenuItem::factory()->create([
            'menu_category_id' => $category->id,
            'title'            => 'Pasta',
            'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
        ]);

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/menu?item_title=Pizza");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.items.0.items'));
        $response->assertJsonPath('data.items.0.items.0.title', 'Pizza Margherita');
    }

    public function test_menu_filters_by_category()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update(['is_open' => true]);

        $category1 = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'title'         => 'Drinks',
            'visibility'    => MenuCategoryVisibilityEnum::VISIBLE->value,
        ]);
        MenuItem::factory()->create(['menu_category_id' => $category1->id, 'availability' => MenuItemAvailabilityEnum::AVAILABLE->value]);

        $category2 = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'title'         => 'Desserts',
            'visibility'    => MenuCategoryVisibilityEnum::VISIBLE->value,
        ]);
        MenuItem::factory()->create(['menu_category_id' => $category2->id, 'availability' => MenuItemAvailabilityEnum::AVAILABLE->value]);

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/menu?category=Drinks");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.items'));
        $response->assertJsonPath('data.items.0.title', 'Drinks');
    }

    public function test_excludes_hidden_categories_and_unavailable_items()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update(['is_open' => true]);

        // Hidden category
        $categoryHidden = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'visibility'    => MenuCategoryVisibilityEnum::HIDDEN->value,
        ]);
        MenuItem::factory()->create(['menu_category_id' => $categoryHidden->id, 'availability' => MenuItemAvailabilityEnum::AVAILABLE->value]);

        // Visible category but unavailable item
        $categoryVisible = MenuCategory::factory()->create([
            'restaurant_id' => $restaurant->id,
            'visibility'    => MenuCategoryVisibilityEnum::VISIBLE->value,
        ]);
        MenuItem::factory()->create(['menu_category_id' => $categoryVisible->id, 'availability' => MenuItemAvailabilityEnum::UNAVAILABLE->value]);

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/menu");

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data.items'));
    }

    public function test_404_if_restaurant_not_found_or_closed()
    {
        [$user, $token] = $this->loginUser();

        $restaurant = Restaurant::factory()->create(['status' => RestaurantStatusEnum::ACTIVE->value]);
        $restaurant->setting()->update(['is_open' => false]);

        $response = $this->withToken($token)->getJson("/api/user/restaurants/{$restaurant->id}/menu");

        $response->assertStatus(404);
    }
}
