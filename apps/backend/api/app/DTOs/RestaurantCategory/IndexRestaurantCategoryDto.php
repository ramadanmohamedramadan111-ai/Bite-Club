<?php

namespace App\DTOs\RestaurantCategory;

use App\Http\Requests\RestaurantCategory\IndexRestaurantCategoryRequest;

class IndexRestaurantCategoryDto
{
    private ?int $perPage;
    private ?bool $all;

    public function __construct(?int $perPage = null, ?bool $all = null)
    {
        $this->perPage = $perPage;
        $this->all = $all;
    }

    public static function fromValidatedRequest(IndexRestaurantCategoryRequest $request): self
    {
        $data = $request->validated();
        return new self(
            isset($data['per_page']) ? (int) $data['per_page'] : null,
            isset($data['all']) ? filter_var($data['all'], FILTER_VALIDATE_BOOLEAN) : null
        );
    }

    public function getPerPage(): ?int
    {
        return $this->perPage;
    }

    public function getAll(): ?bool
    {
        return $this->all;
    }

    public function toArray(): array
    {
        return [
            'per_page' => $this->perPage,
            'all'      => $this->all,
        ];
    }
}
