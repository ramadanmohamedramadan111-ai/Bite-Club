<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Restaurant\Payment\ListRestaurantPaymentsRequest;
use App\Http\Requests\Restaurant\Payment\GetRestaurantPaymentStatisticsRequest;
use App\DTOs\Restaurant\Payment\ListRestaurantPaymentsDto;
use App\DTOs\Restaurant\Payment\GetRestaurantPaymentStatisticsDto;
use App\Services\Application\Restaurant\Payment\RestaurantPaymentApplicationService;
use App\Http\Resources\Restaurant\OrderPaymentResource;
use App\Traits\ApiResponseTrait;

class OrderPaymentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RestaurantPaymentApplicationService $applicationService
    ) {}

    public function index(ListRestaurantPaymentsRequest $request): JsonResponse
    {
        $dto = ListRestaurantPaymentsDto::fromValidatedRequest($request);
        
        $result = $this->applicationService->listPayments($dto);

        return $this->successResponse(
            trans('payment.listed_successfully') ?? 'Payments retrieved successfully.',
            [
                'data' => OrderPaymentResource::collection($result['data']),
                'meta' => $result['meta'],
            ]
        );
    }

    public function statistics(GetRestaurantPaymentStatisticsRequest $request): JsonResponse
    {
        $dto = GetRestaurantPaymentStatisticsDto::fromValidatedRequest($request);
        
        $result = $this->applicationService->statistics($dto);

        return $this->successResponse(
            trans('payment.statistics_retrieved_successfully') ?? 'Payment statistics retrieved successfully.',
            $result
        );
    }
}
