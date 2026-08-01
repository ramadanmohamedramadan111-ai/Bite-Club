<?php

namespace App\DTOs\Restaurant\Invoice;

use App\Http\Requests\Restaurant\Invoice\ShowInvoiceRequest;

class ShowInvoiceDto
{
    public function __construct(
        private readonly int $restaurantId,
        private readonly int $invoiceId
    ) {}

    public static function fromValidatedRequest(ShowInvoiceRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['restaurant_id'],
            $validated['id']
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getInvoiceId(): int
    {
        return $this->invoiceId;
    }
}
