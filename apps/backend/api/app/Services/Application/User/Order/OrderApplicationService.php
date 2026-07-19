<?php

namespace App\Services\Application\User\Order;

use App\DTOs\User\Order\CheckoutPreviewDto;
use App\Services\Domain\User\Order\OrderDomainService;

class OrderApplicationService
{
    public function __construct(
        private readonly OrderDomainService $orderDomainService
    ) {}

    public function previewCheckout(CheckoutPreviewDto $dto): array
    {
        return $this->orderDomainService->previewCheckout(
            $dto->getUserId(),
            $dto->getCartId(),
            $dto->getOrderType(),
            $dto->getLat(),
            $dto->getLong()
        );
    }
}
