<?php

namespace App\DTOs\Restaurant\Payment;

use App\Http\Requests\Restaurant\Payment\ListRestaurantPaymentsRequest;

class ListRestaurantPaymentsDto
{
    public function __construct(
        private readonly int $restaurantId,
        private readonly array $filters,
        private readonly int $perPage
    ) {}

    public static function fromValidatedRequest(ListRestaurantPaymentsRequest $request): self
    {
        $validated = $request->validated();
        
        $filters = [
            'status' => $validated['status'] ?? null,
            'payment_method' => $validated['payment_method'] ?? null,
        ];

        $perPage = (int) ($validated['per_page'] ?? 15);

        return new self(
            (int) $validated['restaurant_id'],
            $filters, 
            $perPage
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getFilters(): array
    {
        return $this->filters;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }
}
