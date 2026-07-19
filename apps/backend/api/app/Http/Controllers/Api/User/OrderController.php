<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\User\Order\CheckoutPreviewRequest;
use App\DTOs\User\Order\CheckoutPreviewDto;
use App\Http\Requests\User\Order\PlaceOrderRequest;
use App\DTOs\User\Order\PlaceOrderDto;
use App\Services\Application\User\Order\OrderApplicationService;
use App\Http\Resources\User\Order\CheckoutPreviewResource;
use Exception;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderApplicationService $orderApplicationService
    ) {}

    public function previewCheckout(CheckoutPreviewRequest $request): JsonResponse
    {
        try {
            $dto = CheckoutPreviewDto::fromValidatedRequest($request);
            $preview = $this->orderApplicationService->previewCheckout($dto);

            return $this->successResponse(
                'Checkout preview generated successfully.',
                new CheckoutPreviewResource($preview)
            );
        } catch (Exception $e) {
            Log::error('Failed to generate checkout preview: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function placeOrder(PlaceOrderRequest $request): JsonResponse
    {
        try {
            $dto = PlaceOrderDto::fromValidatedRequest($request);
            $result = $this->orderApplicationService->placeOrder($dto);

            return $this->successResponse(
                'Order placed successfully.',
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to place order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
