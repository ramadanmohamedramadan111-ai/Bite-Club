<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\RestaurantSetting;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        if (Restaurant::count() === 0) {
            $restaurants = Restaurant::factory()->count(10)->create();
            
            foreach ($restaurants as $restaurant) {
                RestaurantSetting::where('restaurant_id', $restaurant->id)->delete();

                RestaurantSetting::factory()->create([
                    'restaurant_id' => $restaurant->id
                ]);
            }
        }
    }
}
