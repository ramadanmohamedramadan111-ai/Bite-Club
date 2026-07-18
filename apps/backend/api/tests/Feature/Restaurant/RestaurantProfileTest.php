<?php

namespace Tests\Feature\Restaurant;

use App\Models\RestaurantCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class RestaurantProfileTest extends RestaurantAuthTest
{
    public function test_restaurant_can_fetch_profile(): void
    {
        // Arrange
        $category = RestaurantCategory::query()->create([
            'name' => 'Italian Food',
            'slug' => 'italian-food',
        ]);

        [$restaurant, $token] = $this->loginRestaurant([
            'description' => 'Fine dining Italian restaurant',
            'category_id' => $category->id,
        ]);

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/profile');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'name',
                'description',
                'phone_number',
                'address',
                'logo_url',
                'cover_image_url',
                'category_id',
            ]
        ]);

        $response->assertJsonPath('data.name', $restaurant->name);
        $response->assertJsonPath('data.description', 'Fine dining Italian restaurant');
        $response->assertJsonPath('data.category_id', $category->id);
    }

    public function test_restaurant_can_update_profile(): void
    {
        // Arrange
        Storage::fake('public');
        [$restaurant, $token] = $this->loginRestaurant();

        $category = RestaurantCategory::query()->create([
            'name' => 'Pizza',
            'slug' => 'pizza',
        ]);

        $logo = UploadedFile::fake()->image('logo.jpg');
        $cover = UploadedFile::fake()->image('cover.jpg');

        $payload = [
            'name'         => 'Updated Restaurant Name',
            'description'  => 'New awesome description',
            'phone_number' => '01123456789',
            'address'      => '123 New Street Address',
            'category_id'  => $category->id,
            'logo'         => $logo,
            'cover_image'  => $cover,
        ];

        // Act - we use POST with _method=PATCH to support multipart/form-data files upload in Laravel
        $response = $this->withToken($token)->postJson('/api/restaurant/profile?_method=PATCH', $payload);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.name', 'Updated Restaurant Name');
        $response->assertJsonPath('data.description', 'New awesome description');
        $response->assertJsonPath('data.phone_number', '01123456789');
        $response->assertJsonPath('data.address', '123 New Street Address');
        $response->assertJsonPath('data.category_id', $category->id);

        $restaurant->refresh();
        $this->assertEquals('Updated Restaurant Name', $restaurant->name);
        $this->assertEquals('01123456789', $restaurant->phone_number);
        
        $this->assertNotNull($restaurant->logo_url);
        $this->assertNotNull($restaurant->cover_image_url);

        // Verify storage
        $logoPath = str_replace(Storage::disk('public')->url(''), '', $restaurant->logo_url);
        $coverPath = str_replace(Storage::disk('public')->url(''), '', $restaurant->cover_image_url);
        Storage::disk('public')->assertExists($logoPath);
        Storage::disk('public')->assertExists($coverPath);
    }

    public function test_profile_update_validates_input(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();

        $payload = [
            'category_id' => 9999, // Non-existent category
            'logo'        => 'not-an-image',
        ];

        // Act
        $response = $this->withToken($token)->postJson('/api/restaurant/profile?_method=PATCH', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['category_id', 'logo']);
    }
}
