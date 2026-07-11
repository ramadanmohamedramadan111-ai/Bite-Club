<?php

namespace App\DTOs\RestaurantCategory;

use App\Http\Requests\RestaurantCategory\UpdateRestaurantCategoryRequest;
use Illuminate\Support\Str;

class UpdateRestaurantCategoryDto
{
    private int $id;
    private ?string $name;
    private ?string $slug;

    public function __construct(int $id, ?string $name = null, ?string $slug = null)
    {
        $this->id = $id;
        $this->name = $name;
        $this->slug = $slug ?? ($name ? Str::slug($name) : null);
    }

    public static function fromValidatedRequest(UpdateRestaurantCategoryRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $request->route('id'),
            $data['name'] ?? null,
            $data['slug'] ?? null
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function toArray(): array
    {
        $data = [];
        if (!is_null($this->name)) {
            $data['name'] = $this->name;
        }
        if (!is_null($this->slug)) {
            $data['slug'] = $this->slug;
        }
        return $data;
    }
}
