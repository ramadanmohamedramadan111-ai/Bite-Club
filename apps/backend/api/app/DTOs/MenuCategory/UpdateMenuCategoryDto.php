<?php

namespace App\DTOs\MenuCategory;

use App\Http\Requests\MenuCategory\UpdateMenuCategoryRequest;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class UpdateMenuCategoryDto
{
    private int $id;
    private int $restaurantId;
    private string $title;
    private string $iconName;
    private string $shortDescription;
    private string $visibility;

    public function __construct(
        int $id,
        int $restaurantId,
        string $title,
        string $iconName,
        string $shortDescription,
        string $visibility = 'visible'
    ) {
        $this->id = $id;
        $this->restaurantId = $restaurantId;
        $this->title = $title;
        $this->iconName = $iconName;
        $this->shortDescription = $shortDescription;
        $this->visibility = $visibility;
    }

    public static function fromValidatedRequest(UpdateMenuCategoryRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $request->route('id'),
            auth('restaurant')->id(),
            $data['title'],
            $data['icon_name'],
            $data['short_description'],
            $data['visibility'] ?? MenuCategoryVisibilityEnum::VISIBLE->value
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function toArray(): array
    {
        return [
            'title'             => $this->title,
            'icon_name'         => $this->iconName,
            'short_description' => $this->shortDescription,
            'visibility'        => $this->visibility,
        ];
    }
}
