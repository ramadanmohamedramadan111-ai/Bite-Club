<?php

namespace App\Services\Application\Restaurant\Invoice;

use \App\DTOs\Restaurant\Invoice\ShowInvoiceDto;
use \App\Models\Invoice;
use App\DTOs\Restaurant\Invoice\ListInvoicesDto;
use App\Services\Domain\Invoice\InvoiceDomainService;

class RestaurantInvoiceApplicationService
{
    public function __construct(
        private readonly InvoiceDomainService $invoiceDomainService
    ) {}

    public function getInvoices(ListInvoicesDto $dto): array
    {
        $filters = ['status' => $dto->getStatus()];

        return $this->invoiceDomainService->getRestaurantInvoices(
            $dto->getRestaurantId(),
            $filters,
            $dto->getPerPage()
        );
    }

    public function getInvoiceDetails(ShowInvoiceDto $dto): Invoice
    {
        return $this->invoiceDomainService->getRestaurantInvoiceDetails(
            $dto->getInvoiceId(),
            $dto->getRestaurantId()
        );
    }
}
