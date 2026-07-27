<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Order\IndexOrderRequest;
use App\DTOs\Admin\Order\IndexOrderDto;
use App\Services\Application\Admin\AdminOrderApplicationService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct(
        private readonly AdminOrderApplicationService $adminOrderApplicationService
    ) {}

    public function index(IndexOrderRequest $request): JsonResponse
    {
        try {
            $dto = IndexOrderDto::fromValidatedRequest($request);
            $result = $this->adminOrderApplicationService->getOrdersDashboard($dto);

            return $this->successResponse(
                trans('order.list_retrieved') ?? 'Orders retrieved successfully.',
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve admin orders: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function show(int $orderId): JsonResponse
    {
        try {
            $orderResource = $this->adminOrderApplicationService->getOrderDetails($orderId);

            if (!$orderResource) {
                return $this->errorResponse(
                    trans('order.not_found') ?? 'Order not found.',
                    [],
                    404
                );
            }

            return $this->successResponse(
                trans('order.retrieved_successfully') ?? 'Order retrieved successfully.',
                $orderResource
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve admin order details: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
