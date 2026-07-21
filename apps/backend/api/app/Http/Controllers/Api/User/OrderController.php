<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\User\Order\CheckoutPreviewRequest;
use App\DTOs\User\Order\CheckoutPreviewDto;
use App\Http\Requests\User\Order\PlaceOrderRequest;
use App\DTOs\User\Order\PlaceOrderDto;
use App\Http\Requests\User\Order\ActiveOrdersRequest;
use App\DTOs\User\Order\ActiveOrdersDto;
use App\Http\Requests\User\Order\PastOrdersRequest;
use App\DTOs\User\Order\PastOrdersDto;
use App\Services\Application\User\Order\OrderApplicationService;
use App\Http\Resources\User\Order\CheckoutPreviewResource;
use App\Http\Resources\User\Order\UserOrderResource;
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

    public function activeOrders(ActiveOrdersRequest $request): JsonResponse
    {
        try {
            $dto = ActiveOrdersDto::fromValidatedRequest($request);
            $orders = $this->orderApplicationService->getActiveOrders($dto);

            return $this->successResponse(
                trans('order.retrieved_successfully') ?? 'Orders retrieved successfully.',
                UserOrderResource::collection($orders)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve active orders: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function pastOrders(PastOrdersRequest $request): JsonResponse
    {
        try {
            $dto = PastOrdersDto::fromValidatedRequest($request);
            $orders = $this->orderApplicationService->getPastOrders($dto);

            
            $orders->withPath(config('app.url') . $request->getPathInfo());

            $paginatedData = UserOrderResource::collection($orders)->response()->getData(true);

            return response()->json(array_merge([
                'success' => true,
                'message' => trans('order.retrieved_successfully') ?? 'Orders retrieved successfully.',
            ], $paginatedData), 200);

        } catch (Exception $e) {
            Log::error('Failed to retrieve past orders: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
