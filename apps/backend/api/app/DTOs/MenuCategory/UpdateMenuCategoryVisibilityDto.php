<?php

namespace App\DTOs\MenuCategory;

use App\Http\Requests\MenuCategory\UpdateMenuCategoryVisibilityRequest;

class UpdateMenuCategoryVisibilityDto
{
    private int $id;
    private int $restaurantId;
    private string $visibility;

    public function __construct(int $id, int $restaurantId, string $visibility)
    {
        $this->id = $id;
        $this->restaurantId = $restaurantId;
        $this->visibility = $visibility;
    }

    public static function fromValidatedRequest(UpdateMenuCategoryVisibilityRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $request->route('id'),
            auth('restaurant')->id(),
            $data['visibility']
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
            'visibility' => $this->visibility,
        ];
    }
}
