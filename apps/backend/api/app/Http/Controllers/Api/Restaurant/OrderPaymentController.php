<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Restaurant\Payment\ListRestaurantPaymentsRequest;
use App\DTOs\Restaurant\Payment\ListRestaurantPaymentsDto;
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
}
