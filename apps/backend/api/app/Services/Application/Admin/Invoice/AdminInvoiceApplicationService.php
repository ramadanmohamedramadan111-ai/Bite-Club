<?php

namespace App\Services\Application\Admin\Invoice;

use \App\Models\Invoice;
use App\DTOs\Admin\Invoice\ListAdminInvoicesDto;
use App\DTOs\Admin\Invoice\ShowAdminInvoiceDto;
use App\Services\Domain\Invoice\InvoiceDomainService;

class AdminInvoiceApplicationService
{
    public function __construct(
        private readonly InvoiceDomainService $invoiceDomainService
    ) {}

    public function listInvoices(ListAdminInvoicesDto $dto): array
    {
        return $this->invoiceDomainService->getAllInvoices(
            $dto->getFilters(),
            $dto->getPerPage()
        );
    }

    public function getInvoiceDetails(ShowAdminInvoiceDto $dto): Invoice
    {
        return $this->invoiceDomainService->getAdminInvoiceDetails($dto->getId());
    }

    public function getStatistics(): array
    {
        return $this->invoiceDomainService->getInvoiceStatistics();
    }
}
