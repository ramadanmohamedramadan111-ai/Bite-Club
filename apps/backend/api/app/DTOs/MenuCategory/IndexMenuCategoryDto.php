<?php

namespace App\DTOs\MenuCategory;

use App\Http\Requests\MenuCategory\IndexMenuCategoryRequest;

class IndexMenuCategoryDto
{
    private array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public static function fromValidatedRequest(IndexMenuCategoryRequest $request): self
    {
        return new self($request->validated());
    }

    public function toArray(): array
    {
        return $this->filters;
    }
}
