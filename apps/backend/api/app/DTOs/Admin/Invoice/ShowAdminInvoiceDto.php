<?php

namespace App\DTOs\Admin\Invoice;

use App\Http\Requests\Admin\Invoice\ShowAdminInvoiceRequest;

class ShowAdminInvoiceDto
{
    public function __construct(
        private readonly int $id
    ) {}

    public static function fromValidatedRequest(ShowAdminInvoiceRequest $request): self
    {
        return new self((int) $request->validated('id'));
    }

    public function getId(): int
    {
        return $this->id;
    }
}
