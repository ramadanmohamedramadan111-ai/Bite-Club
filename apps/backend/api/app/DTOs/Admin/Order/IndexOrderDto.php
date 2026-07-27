<?php

namespace App\DTOs\Admin\Order;

use App\Http\Requests\Admin\Order\IndexOrderRequest;

class IndexOrderDto
{
    public function __construct(
        private ?string $search = null,
        private ?string $status = null,
        private ?int $restaurantId = null,
        private ?string $period = null,
        private ?string $from = null,
        private ?string $to = null,
        private ?int $page = null
    ) {}

    public static function fromValidatedRequest(IndexOrderRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['search'] ?? null,
            $data['status'] ?? null,
            isset($data['restaurant_id']) ? (int) $data['restaurant_id'] : null,
            $data['period'] ?? null,
            $data['from'] ?? null,
            $data['to'] ?? null,
            isset($data['page']) ? (int) $data['page'] : null
        );
    }

    public function toArray(): array
    {
        return [
            'search'        => $this->search,
            'status'        => $this->status,
            'restaurant_id' => $this->restaurantId,
            'period'        => $this->period,
            'from'          => $this->from,
            'to'            => $this->to,
            'page'          => $this->page,
        ];
    }

    public function getSearch(): ?string
    {
        return $this->search;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function getRestaurantId(): ?int
    {
        return $this->restaurantId;
    }

    public function getPeriod(): ?string
    {
        return $this->period;
    }

    public function getFrom(): ?string
    {
        return $this->from;
    }

    public function getTo(): ?string
    {
        return $this->to;
    }

    public function getPage(): ?int
    {
        return $this->page;
    }
}
