<?php

namespace App\DTOs\MenuCategory;

use App\Http\Requests\MenuCategory\StoreMenuCategoryRequest;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class StoreMenuCategoryDto
{
    private int $restaurantId;
    private string $title;
    private string $iconName;
    private string $shortDescription;
    private string $visibility;

    public function __construct(
        int $restaurantId,
        string $title,
        string $iconName,
        string $shortDescription,
        string $visibility = 'visible'
    ) {
        $this->restaurantId = $restaurantId;
        $this->title = $title;
        $this->iconName = $iconName;
        $this->shortDescription = $shortDescription;
        $this->visibility = $visibility;
    }

    public static function fromValidatedRequest(StoreMenuCategoryRequest $request): self
    {
        $data = $request->validated();
        return new self(
            auth('restaurant')->id(),
            $data['title'],
            $data['icon_name'],
            $data['short_description'],
            $data['visibility'] ?? MenuCategoryVisibilityEnum::VISIBLE->value
        );
    }

    public function toArray(): array
    {
        return [
            'restaurant_id'     => $this->restaurantId,
            'title'             => $this->title,
            'icon_name'         => $this->iconName,
            'short_description' => $this->shortDescription,
            'visibility'        => $this->visibility,
        ];
    }
}
