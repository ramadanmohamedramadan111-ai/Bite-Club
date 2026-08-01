<?php

namespace App\Jobs\Ai;

use App\Models\Restaurant;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateDailyReportsJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $restaurants = Restaurant::where('status', RestaurantStatusEnum::ACTIVE)->get();

        foreach ($restaurants as $restaurant) {
            GenerateRestaurantReportJob::dispatch($restaurant);
        }
    }
}
