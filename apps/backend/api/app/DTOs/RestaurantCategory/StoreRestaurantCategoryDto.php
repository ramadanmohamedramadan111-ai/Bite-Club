<?php

namespace App\DTOs\RestaurantCategory;

use App\Http\Requests\RestaurantCategory\StoreRestaurantCategoryRequest;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class StoreRestaurantCategoryDto
{
    private string $name;
    private string $slug;
    private ?UploadedFile $image;

    public function __construct(string $name, ?string $slug = null, ?UploadedFile $image = null)
    {
        $this->name = $name;
        $this->slug = $slug ?? Str::slug($name);
        $this->image = $image;
    }

    public static function fromValidatedRequest(StoreRestaurantCategoryRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $data['name'],
            $data['slug'] ?? null,
            $data['image'] ?? null
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

    public function getImage(): ?UploadedFile
    {
        return $this->image;
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
        ];
    }
}
