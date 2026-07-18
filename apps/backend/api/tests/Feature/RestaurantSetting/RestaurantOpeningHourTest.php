<?php

namespace Tests\Feature\RestaurantSetting;

use App\Models\RestaurantOpeningHour;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;
use Illuminate\Support\Carbon;

class RestaurantOpeningHourTest extends RestaurantAuthTest
{
    public function test_restaurant_creation_creates_default_opening_hours(): void
    {
        // Act - Creating a restaurant triggers the observer
        $restaurant = $this->createRestaurant();

        // Assert - 7 records created
        $this->assertDatabaseCount('restaurant_opening_hours', 7);
        $hours = $restaurant->openingHours;
        $this->assertCount(7, $hours);

        foreach ($hours as $hour) {
            $this->assertEquals('10:00', $hour->opens_at);
            $this->assertEquals('22:00', $hour->closes_at);
            $this->assertFalse($hour->is_closed);
        }
    }

    public function test_restaurant_can_fetch_opening_hours(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();

        // Act
        $response = $this->withToken($token)->getJson('/api/restaurant/settings/opening-hours');

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'day_of_week',
                    'opens_at',
                    'closes_at',
                    'is_closed',
                ]
            ]
        ]);

        $data = $response->json('data');
        $this->assertCount(7, $data);
        $this->assertEquals(0, $data[0]['day_of_week']);
        $this->assertEquals('10:00', $data[0]['opens_at']);
        $this->assertEquals('22:00', $data[0]['closes_at']);
        $this->assertFalse($data[0]['is_closed']);
    }

    public function test_restaurant_can_update_opening_hours(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();

        $payload = [
            'opening_hours' => [
                [
                    'day_of_week' => 0,
                    'opens_at' => '12:00',
                    'closes_at' => '23:00',
                    'is_closed' => false,
                ],
                [
                    'day_of_week' => 1,
                    'is_closed' => true,
                ]
            ]
        ];

        // Act
        $response = $this->withToken($token)->putJson('/api/restaurant/settings/opening-hours', $payload);

        // Assert
        $response->assertOk();
        
        $this->assertDatabaseHas('restaurant_opening_hours', [
            'restaurant_id' => $restaurant->id,
            'day_of_week' => 0,
            'opens_at' => '12:00',
            'closes_at' => '23:00',
            'is_closed' => false,
        ]);

        $this->assertDatabaseHas('restaurant_opening_hours', [
            'restaurant_id' => $restaurant->id,
            'day_of_week' => 1,
            'opens_at' => null,
            'closes_at' => null,
            'is_closed' => true,
        ]);
    }

    public function test_update_validates_required_fields_unless_closed(): void
    {
        // Arrange
        [$restaurant, $token] = $this->loginRestaurant();

        // Invalid: missing opens_at/closes_at when is_closed is false
        $payload = [
            'opening_hours' => [
                [
                    'day_of_week' => 0,
                    'is_closed' => false,
                ]
            ]
        ];

        // Act
        $response = $this->withToken($token)->putJson('/api/restaurant/settings/opening-hours', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'opening_hours.0.opens_at',
            'opening_hours.0.closes_at',
        ]);
    }

    public function test_is_open_now_standard_hours(): void
    {
        // Arrange
        $restaurant = $this->createRestaurant();
        
        // Sunday = 0
        RestaurantOpeningHour::query()->where([
            'restaurant_id' => $restaurant->id,
            'day_of_week' => 0,
        ])->update([
            'opens_at' => '10:00:00',
            'closes_at' => '22:00:00',
            'is_closed' => false,
        ]);

        // Mock current time to Sunday 12:00:00
        Carbon::setTestNow(Carbon::parse('2026-07-19 12:00:00')); // Sunday
        $this->assertTrue($restaurant->isOpenNow());

        // Mock current time to Sunday 09:00:00 (before opens)
        Carbon::setTestNow(Carbon::parse('2026-07-19 09:00:00'));
        $this->assertFalse($restaurant->isOpenNow());

        // Mock current time to Sunday 23:00:00 (after closes)
        Carbon::setTestNow(Carbon::parse('2026-07-19 23:00:00'));
        $this->assertFalse($restaurant->isOpenNow());

        Carbon::setTestNow(); // Reset test time
    }

    public function test_is_open_now_overnight_shifts(): void
    {
        // Arrange
        $restaurant = $this->createRestaurant();

        // Friday = 5
        RestaurantOpeningHour::query()->where([
            'restaurant_id' => $restaurant->id,
            'day_of_week' => 5,
        ])->update([
            'opens_at' => '18:00:00',
            'closes_at' => '02:00:00',
            'is_closed' => false,
        ]);

        // Saturday = 6 (let's close it to isolate yesterday's shift)
        RestaurantOpeningHour::query()->where([
            'restaurant_id' => $restaurant->id,
            'day_of_week' => 6,
        ])->update([
            'is_closed' => true,
        ]);

        // Friday 20:00 (open on Friday's shift before midnight)
        Carbon::setTestNow(Carbon::parse('2026-07-24 20:00:00')); // Friday
        $this->assertTrue($restaurant->isOpenNow());

        // Saturday 01:00 (still open on Friday's shift after midnight)
        Carbon::setTestNow(Carbon::parse('2026-07-25 01:00:00')); // Saturday
        $this->assertTrue($restaurant->isOpenNow());

        // Saturday 03:00 (closed after Friday's shift ends at 02:00)
        Carbon::setTestNow(Carbon::parse('2026-07-25 03:00:00')); // Saturday
        $this->assertFalse($restaurant->isOpenNow());

        Carbon::setTestNow(); // Reset test time
    }
}
