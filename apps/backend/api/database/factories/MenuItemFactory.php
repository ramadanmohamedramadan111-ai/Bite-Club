<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuItemFactory extends Factory
{
    protected $model = MenuItem::class;

    public function definition(): array
    {
        return [
            'menu_category_id' => MenuCategory::factory(),
            'title' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'image_url' => 'menu_items/fake_image.jpg',
            'price' => $this->faker->randomFloat(2, 5, 50),
            'availability' => MenuItemAvailabilityEnum::AVAILABLE->value,
        ];
    }
}
