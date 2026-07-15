<?php

namespace App\DTOs\MenuItem;

use App\Http\Requests\MenuItem\StoreMenuItemRequest;
use Illuminate\Http\UploadedFile;

class StoreMenuItemDto
{
    private int $restaurantId;
    private int $menuCategoryId;
    private string $title;
    private string $description;
    private float $price;
    private string $availability;
    private UploadedFile $image;

    public function __construct(
        int $restaurantId,
        int $menuCategoryId,
        string $title,
        string $description,
        float $price,
        UploadedFile $image,
        string $availability = 'available'
    ) {
        $this->restaurantId = $restaurantId;
        $this->menuCategoryId = $menuCategoryId;
        $this->title = $title;
        $this->description = $description;
        $this->price = $price;
        $this->image = $image;
        $this->availability = $availability;
    }

    public static function fromValidatedRequest(StoreMenuItemRequest $request): self
    {
        $data = $request->validated();
        return new self(
            auth('restaurant')->id(),
            $data['menu_category_id'],
            $data['title'],
            $data['description'],
            (float) $data['price'],
            $request->file('image'),
            $data['availability'] ?? 'available'
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getMenuCategoryId(): int
    {
        return $this->menuCategoryId;
    }

    public function getImage(): UploadedFile
    {
        return $this->image;
    }

    public function toArray(): array
    {
        return [
            'menu_category_id' => $this->menuCategoryId,
            'title'            => $this->title,
            'description'      => $this->description,
            'price'            => $this->price,
            'availability'     => $this->availability,
        ];
    }
}
