<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuCategoryFactory extends Factory
{
    protected $model = MenuCategory::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'title' => $this->faker->words(2, true),
            'icon_name' => 'icon-' . $this->faker->word(),
            'short_description' => $this->faker->sentence(),
            'visibility' => MenuCategoryVisibilityEnum::VISIBLE->value,
        ];
    }
}
