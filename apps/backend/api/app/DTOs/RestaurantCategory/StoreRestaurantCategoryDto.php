<?php

namespace App\DTOs\RestaurantCategory;

use App\Http\Requests\RestaurantCategory\StoreRestaurantCategoryRequest;
use Illuminate\Support\Str;

class StoreRestaurantCategoryDto
{
    private string $name;
    private string $slug;

    public function __construct(string $name, ?string $slug = null)
    {
        $this->name = $name;
        $this->slug = $slug ?? Str::slug($name);
    }

    public static function fromValidatedRequest(StoreRestaurantCategoryRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $data['name'],
            $data['slug'] ?? null
        );
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
        ];
    }
}
