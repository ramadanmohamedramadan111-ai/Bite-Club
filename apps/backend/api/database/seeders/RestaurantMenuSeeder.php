<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

class RestaurantMenuSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = Restaurant::all();

        if ($restaurants->isEmpty()) {
            return;
        }

        foreach ($restaurants as $restaurant) {
            // Check if the restaurant already has menu categories to avoid duplication
            if (MenuCategory::where('restaurant_id', $restaurant->id)->exists()) {
                continue;
            }

            // Create 3-5 categories for each restaurant
            $categoriesCount = rand(3, 5);
            for ($i = 0; $i < $categoriesCount; $i++) {
                $category = MenuCategory::create([
                    'restaurant_id'     => $restaurant->id,
                    'title'             => 'Category ' . ($i + 1) . ' - ' . $restaurant->name,
                    'icon_name'         => 'restaurant-menu',
                    'short_description' => 'Delicious items in this category.',
                    'visibility'        => MenuCategoryVisibilityEnum::VISIBLE->value,
                ]);

                // Create 5-10 items for each category
                $itemsCount = rand(5, 10);
                for ($j = 0; $j < $itemsCount; $j++) {
                    MenuItem::create([
                        'menu_category_id' => $category->id,
                        'title'            => 'Item ' . ($j + 1) . ' in ' . $category->title,
                        'description'      => 'A very delicious item prepared fresh daily.',
                        'image_url'        => 'storage/menu-items/default-item.jpeg',
                        'price'            => rand(50, 300) + (rand(0, 99) / 100),
                        'availability'     => MenuItemAvailabilityEnum::AVAILABLE->value,
                    ]);
                }
            }
        }
    }
}
