<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\Order\LiveOrdersRequest;
use App\Http\Requests\Restaurant\Order\AvailableOrderStatusRequest;
use App\Http\Resources\Restaurant\Order\LiveOrderResource;
use App\DTOs\Restaurant\Order\LiveOrdersDto;
use App\DTOs\Restaurant\Order\AvailableOrderStatusDto;
use App\Services\Application\Restaurant\Order\RestaurantOrderApplicationService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RestaurantOrderApplicationService $applicationService
    ) {}

    public function liveOrders(LiveOrdersRequest $request): JsonResponse
    {
        $dto = LiveOrdersDto::fromValidatedRequest($request);
        
        $orders = $this->applicationService->getLiveOrders($dto);

        return $this->successResponse(
            trans('order.retrieved_successfully') ?? 'Live orders retrieved successfully',
            LiveOrderResource::collection($orders)
        );
    }

    public function availableStatuses(AvailableOrderStatusRequest $request): JsonResponse
    {
        $dto = AvailableOrderStatusDto::fromValidatedRequest($request);

        $statuses = $this->applicationService->getAvailableStatuses($dto);

        return $this->successResponse(
            trans('order.statuses_retrieved_successfully') ?? 'Available statuses retrieved successfully',
            $statuses
        );
    }
}
