<?php

namespace App\DTOs\Restaurant\Order;

use App\Http\Requests\Restaurant\Order\OrderHistoryRequest;

class OrderHistoryDto
{
    public function __construct(
        private readonly int $restaurantId,
        private readonly int $page,
        private readonly int $perPage,
        private readonly ?string $status,
        private readonly ?string $orderType,
        private readonly ?string $fromDate,
        private readonly ?string $toDate
    ) {}

    public static function fromValidatedRequest(OrderHistoryRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['restaurant_id'],
            (int) ($validated['page'] ?? 1),
            (int) ($validated['per_page'] ?? 15),
            $validated['status'] ?? null,
            $validated['order_type'] ?? null,
            $validated['from_date'] ?? null,
            $validated['to_date'] ?? null
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function getOrderType(): ?string
    {
        return $this->orderType;
    }

    public function getFromDate(): ?string
    {
        return $this->fromDate;
    }

    public function getToDate(): ?string
    {
        return $this->toDate;
    }

    public function getFilters(): array
    {
        $filters = [];

        if ($this->status) {
            $filters['status'] = $this->status;
        }

        if ($this->orderType) {
            $filters['order_type'] = $this->orderType;
        }

        if ($this->fromDate) {
            $filters['from_date'] = $this->fromDate;
        }

        if ($this->toDate) {
            $filters['to_date'] = $this->toDate;
        }

        return $filters;
    }
}
