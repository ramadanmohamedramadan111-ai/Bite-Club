<?php

namespace App\DTOs\Restaurant\Invoice;

use App\Http\Requests\Restaurant\Invoice\ListInvoicesRequest;

class ListInvoicesDto
{
    public function __construct(
        private readonly int $restaurantId,
        private readonly ?string $status,
        private readonly int $perPage
    ) {}

    public static function fromValidatedRequest(ListInvoicesRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['restaurant_id'],
            $validated['status'] ?? null,
            $validated['per_page'] ?? 15
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }
}
