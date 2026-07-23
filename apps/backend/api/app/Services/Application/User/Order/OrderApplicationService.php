<?php

namespace App\Services\Application\User\Order;

use App\DTOs\User\Order\CheckoutPreviewDto;
use App\DTOs\User\Order\PlaceOrderDto;
use App\DTOs\User\Order\ActiveOrdersDto;
use App\DTOs\User\Order\PastOrdersDto;
use App\DTOs\User\Order\OrderDetailsDto;
use App\Services\Domain\User\Order\OrderDomainService;
use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

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
            $dto->getLong(),
            $dto->getPoints()
        );
    }

    public function placeOrder(PlaceOrderDto $dto): array
    {
        return $this->orderDomainService->placeOrder(
            $dto->getUserId(),
            $dto->getOrderType(),
            $dto->getPaymentOptionId(),
            $dto->getLat(),
            $dto->getLong(),
            $dto->getPoints()
        );
    }

    public function getActiveOrders(ActiveOrdersDto $dto): Collection
    {
        return $this->orderDomainService->getActiveOrders($dto->getUserId());
    }

    public function getPastOrders(PastOrdersDto $dto): LengthAwarePaginator
    {
        return $this->orderDomainService->getPastOrders(
            $dto->getUserId(),
            $dto->getPage(),
            $dto->getPerPage()
        );
    }

    public function getOrderDetails(OrderDetailsDto $dto): Order
    {
        return $this->orderDomainService->getOrderDetails(
            $dto->getOrderId(),
            $dto->getUserId()
        );
    }
}
