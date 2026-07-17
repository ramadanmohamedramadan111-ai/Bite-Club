<?php

namespace App\DTOs\User\Restaurant;

use App\Http\Requests\User\Restaurant\ListRestaurantsRequest;

class ListRestaurantsDto
{
    public function __construct(
        private array $filters
    ) {}

    public static function fromValidatedRequest(ListRestaurantsRequest $request): self
    {
        return new self($request->validated());
    }

    public function getFilters(): array
    {
        return $this->filters;
    }
}
