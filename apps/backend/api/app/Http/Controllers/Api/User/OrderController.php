<?php

namespace App\Http\Controllers\Api\User;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\DTOs\User\Order\ActiveOrdersDto;
use App\DTOs\User\Order\CheckoutPreviewDto;
use App\DTOs\User\Order\OrderDetailsDto;
use App\DTOs\User\Order\PastOrdersDto;
use App\DTOs\User\Order\PlaceOrderDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Order\ActiveOrdersRequest;
use App\Http\Requests\User\Order\CheckoutPreviewRequest;
use App\Http\Requests\User\Order\OrderDetailsRequest;
use App\Http\Requests\User\Order\PastOrdersRequest;
use App\Http\Requests\User\Order\PlaceOrderRequest;
use App\Http\Resources\User\Order\CheckoutPreviewResource;
use App\Http\Resources\User\Order\UserOrderDetailsResource;
use App\Http\Resources\User\Order\UserOrderResource;
use App\Services\Application\User\Order\OrderApplicationService;
use Exception;
use Illuminate\Http\JsonResponse;
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

    public function show(OrderDetailsRequest $request): JsonResponse
    {
        try {
            $dto = OrderDetailsDto::fromValidatedRequest($request);
            $order = $this->orderApplicationService->getOrderDetails($dto);

            return $this->successResponse(
                trans('order.retrieved_successfully') ?? 'Order retrieved successfully.',
                new UserOrderDetailsResource($order)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve order details: ' . $e->getMessage());

            if ($e instanceof NotFoundHttpException) {
                return $this->errorResponse($e->getMessage(), [], 404);
            }

            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
