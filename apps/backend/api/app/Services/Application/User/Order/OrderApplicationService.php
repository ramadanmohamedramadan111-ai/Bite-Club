<?php

namespace App\Services\Application\User\Order;

use App\DTOs\User\Order\CheckoutPreviewDto;
use App\DTOs\User\Order\PlaceOrderDto;
use App\DTOs\User\Order\ActiveOrdersDto;
use App\Services\Domain\User\Order\OrderDomainService;
use Illuminate\Database\Eloquent\Collection;

class OrderApplicationService
{
    public function __construct(
        private readonly OrderDomainService $orderDomainService
    ) {}

    public function previewCheckout(CheckoutPreviewDto $dto): array
    {
        return $this->orderDomainService->previewCheckout(
            $dto->getUserId(),
            $dto->getOrderType(),
            $dto->getLat(),
            $dto->getLong()
        );
    }

    public function placeOrder(PlaceOrderDto $dto): array
    {
        return $this->orderDomainService->placeOrder(
            $dto->getUserId(),
            $dto->getOrderType(),
            $dto->getPaymentOptionId(),
            $dto->getLat(),
            $dto->getLong()
        );
    }

    public function getActiveOrders(ActiveOrdersDto $dto): Collection
    {
        return $this->orderDomainService->getActiveOrders($dto->getUserId());
    }
}
