<?php

namespace App\Services\Application\Restaurant\Payment;

use App\DTOs\Restaurant\Payment\ListRestaurantPaymentsDto;
use App\DTOs\Restaurant\Payment\GetRestaurantPaymentStatisticsDto;
use App\Services\Domain\OrderPayment\OrderPaymentDomainService;

class RestaurantPaymentApplicationService
{
    public function __construct(
        private readonly OrderPaymentDomainService $orderPaymentDomainService
    ) {}

    public function listPayments(ListRestaurantPaymentsDto $dto): array
    {
        return $this->orderPaymentDomainService->listRestaurantPayments(
            $dto->getRestaurantId(),
            $dto->getFilters(),
            $dto->getPerPage()
        );
    }

    public function statistics(GetRestaurantPaymentStatisticsDto $dto): array
    {
        return $this->orderPaymentDomainService->getRestaurantStatistics(
            $dto->getRestaurantId()
        );
    }
}
