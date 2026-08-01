<?php

namespace Tests\Feature\Restaurant;

use App\Models\Restaurant;
use App\Models\RestaurantReport;
use App\Jobs\Ai\GenerateDailyReportsJob;
use App\Jobs\Ai\GenerateRestaurantReportJob;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RestaurantReportTest extends TestCase
{
    use RefreshDatabase;

    protected function createRestaurant(array $attributes = []): Restaurant
    {
        return Restaurant::query()->create(array_merge([
            'name' => 'Test Restaurant',
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => Hash::make('password123'),
            'phone_number' => fake()->unique()->numerify('01#########'),
            'address' => 'Test Address',
            'status' => RestaurantStatusEnum::ACTIVE->value,
        ], $attributes));
    }

    protected function loginRestaurant(Restaurant $restaurant): string
    {
        $response = $this->postJson('/api/restaurant/login', [
            'email' => $restaurant->email,
            'password' => 'password123',
        ]);

        $response->assertOk();
        return $response->json('data.access_token');
    }

    public function test_reports_endpoint_requires_restaurant_auth(): void
    {
        $response = $this->getJson('/api/restaurant/reports');
        $response->assertStatus(401);
    }

    public function test_reports_endpoint_returns_latest_three_reports(): void
    {
        $restaurant = $this->createRestaurant();
        $token = $this->loginRestaurant($restaurant);

        // Create 4 reports to check that only latest 3 are returned
        RestaurantReport::create([
            'restaurant_id' => $restaurant->id,
            'report_date' => '2026-08-02',
            'report_en' => ['summary' => 'Today report'],
            'report_ar' => ['summary' => 'تقرير اليوم'],
        ]);

        RestaurantReport::create([
            'restaurant_id' => $restaurant->id,
            'report_date' => '2026-08-01',
            'report_en' => ['summary' => 'Yesterday report'],
            'report_ar' => ['summary' => 'تقرير أمس'],
        ]);

        RestaurantReport::create([
            'restaurant_id' => $restaurant->id,
            'report_date' => '2026-07-31',
            'report_en' => ['summary' => 'Two days ago report'],
            'report_ar' => ['summary' => 'تقرير قبل يومين'],
        ]);

        RestaurantReport::create([
            'restaurant_id' => $restaurant->id,
            'report_date' => '2026-07-30',
            'report_en' => ['summary' => 'Three days ago report'],
            'report_ar' => ['summary' => 'تقرير قبل ثلاثة أيام'],
        ]);

        $response = $this->withToken($token)->getJson('/api/restaurant/reports');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonPath('data.0.report_date', '2026-08-02');
        $response->assertJsonPath('data.1.report_date', '2026-08-01');
        $response->assertJsonPath('data.2.report_date', '2026-07-31');
    }

    public function test_report_generation_jobs(): void
    {
        $restaurant = $this->createRestaurant();

        config(['services.ai.internal_api_key' => 'test_key']);
        config(['services.ai.service_url' => 'http://ai-service']);

        Http::fake([
            'http://ai-service/api/v1/chat/*' => Http::sequence()
                ->push(['summary' => 'English summary', 'overall_score' => 90], 200) // First call for 'en'
                ->push(['summary' => 'Arabic summary', 'overall_score' => 88], 200), // Second call for 'ar'
        ]);

        $job = new GenerateRestaurantReportJob($restaurant);
        $job->handle(app(\App\Services\Ai\AiProxyService::class));

        $this->assertDatabaseHas('restaurant_reports', [
            'restaurant_id' => $restaurant->id,
            'report_date' => now()->toDateString(),
        ]);

        $report = RestaurantReport::where('restaurant_id', $restaurant->id)->first();
        $this->assertEquals('English summary', $report->report_en['summary']);
        $this->assertEquals('Arabic summary', $report->report_ar['summary']);
    }
}
