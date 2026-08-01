<?php

namespace App\DTOs\Admin\Invoice;

use App\Http\Requests\Admin\Invoice\ListAdminInvoicesRequest;

class ListAdminInvoicesDto
{
    public function __construct(
        private readonly array $filters,
        private readonly int $perPage
    ) {}

    public static function fromValidatedRequest(ListAdminInvoicesRequest $request): self
    {
        $validated = $request->validated();
        
        $filters = [
            'status' => $validated['status'] ?? null,
            'restaurant_id' => $validated['restaurant_id'] ?? null,
        ];

        $perPage = (int) ($validated['per_page'] ?? 15);

        return new self($filters, $perPage);
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
