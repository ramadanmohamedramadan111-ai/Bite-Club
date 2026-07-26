<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\GroupOrder\CreateGroupOrderRequest;
use App\Http\Requests\User\GroupOrder\AddGroupOrderItemRequest;
use App\Http\Requests\User\GroupOrder\RemoveGroupOrderItemRequest;
use App\Http\Requests\User\GroupOrder\UpdateGroupOrderItemQuantityRequest;
use App\Http\Requests\User\GroupOrder\GetGroupOrderRequest;
use App\Http\Requests\User\GroupOrder\GroupOrderPreviewRequest;
use App\Http\Requests\User\GroupOrder\UnlockGroupOrderRequest;
use App\Http\Requests\User\GroupOrder\PlaceGroupOrderRequest;
use App\DTOs\User\GroupOrder\CreateGroupOrderDto;
use App\DTOs\User\GroupOrder\AddGroupOrderItemDto;
use App\DTOs\User\GroupOrder\RemoveGroupOrderItemDto;
use App\DTOs\User\GroupOrder\UpdateGroupOrderItemQuantityDto;
use App\DTOs\User\GroupOrder\ClearGroupOrderItemsDto;
use App\DTOs\User\GroupOrder\GetGroupOrderDto;
use App\DTOs\User\GroupOrder\GroupOrderPreviewDto;
use App\DTOs\User\GroupOrder\UnlockGroupOrderDto;
use App\DTOs\User\GroupOrder\CancelGroupOrderDto;
use App\DTOs\User\GroupOrder\PlaceGroupOrderDto;
use App\DTOs\User\GroupOrder\GroupOrderHistoryDto;
use App\DTOs\User\GroupOrder\ActiveGroupOrdersDto;
use App\Http\Requests\User\GroupOrder\GroupOrderHistoryRequest;
use App\Http\Requests\User\GroupOrder\ActiveGroupOrdersRequest;
use App\Http\Requests\User\GroupOrder\CancelGroupOrderRequest;
use App\Http\Requests\User\GroupOrder\ClearGroupOrderItemsRequest;
use App\Services\Application\User\GroupOrder\GroupOrderApplicationService;
use App\Http\Resources\User\GroupOrder\GroupOrderResource;
use App\Http\Resources\User\GroupOrder\GroupOrderSimpleResource;
use App\Http\Resources\User\Order\CheckoutPreviewResource;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Log;

class GroupOrderController extends Controller
{
    use ApiResponseTrait;
    public function __construct(
        private GroupOrderApplicationService $groupOrderApplicationService
    ) {}

    public function store(CreateGroupOrderRequest $request): JsonResponse
    {
        try {
            $dto = CreateGroupOrderDto::fromValidatedRequest($request);

            $groupOrder = $this->groupOrderApplicationService->createGroupOrder($dto);

            return $this->successResponse(
                trans('group_order.created_successfully') ?? 'Group order created successfully',
                [
                    'group_order_id' => $groupOrder->id,
                    'status'         => $groupOrder->status,
                ],
                201
            );
        } catch (Exception $e) {
            Log::error('Failed to create group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function addItem(AddGroupOrderItemRequest $request): JsonResponse
    {
        try {
            $dto = AddGroupOrderItemDto::fromValidatedRequest($request);

            $item = $this->groupOrderApplicationService->addItem($dto);

            return $this->successResponse(
                trans('group_order.item_added_successfully') ?? 'Item added successfully',
                [
                    'item_id'   => $item->id,
                    'quantity'  => $item->quantity,
                ],
                201
            );
        } catch (Exception $e) {
            Log::error('Failed to add item to group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function removeItem(RemoveGroupOrderItemRequest $request): JsonResponse
    {
        try {
            $dto = RemoveGroupOrderItemDto::fromValidatedRequest($request);

            $this->groupOrderApplicationService->removeItem($dto);

            return $this->successResponse(
                trans('group_order.item_removed_successfully') ?? 'Item removed successfully'
            );
        } catch (Exception $e) {
            Log::error('Failed to remove item from group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function updateItemQuantity(UpdateGroupOrderItemQuantityRequest $request): JsonResponse
    {
        try {
            $dto = UpdateGroupOrderItemQuantityDto::fromValidatedRequest($request);

            $this->groupOrderApplicationService->updateItemQuantity($dto);

            return $this->successResponse(
                trans('group_order.item_quantity_updated_successfully') ?? 'Item quantity updated successfully'
            );
        } catch (Exception $e) {
            Log::error('Failed to update group order item quantity: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function clearUserItems(ClearGroupOrderItemsRequest $request): JsonResponse
    {
        try {
            $dto = ClearGroupOrderItemsDto::fromValidatedRequest($request);

            $this->groupOrderApplicationService->clearUserItems($dto);

            return $this->successResponse(
                trans('group_order.items_cleared_successfully') ?? 'Your items have been cleared from the group order successfully'
            );
        } catch (Exception $e) {
            Log::error('Failed to clear user items from group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function show(GetGroupOrderRequest $request): JsonResponse
    {
        try {
            $dto = GetGroupOrderDto::fromValidatedRequest($request);

            $groupOrder = $this->groupOrderApplicationService->getGroupOrder($dto);

            return $this->successResponse(
                trans('group_order.retrieved_successfully') ?? 'Group order retrieved successfully',
                new GroupOrderResource($groupOrder)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function previewCheckout(GroupOrderPreviewRequest $request): JsonResponse
    {
        try {
            $dto = GroupOrderPreviewDto::fromValidatedRequest($request);

            $previewData = $this->groupOrderApplicationService->previewCheckout($dto);

            return $this->successResponse(
                trans('group_order.preview_successful') ?? 'Group order preview successful',
                new CheckoutPreviewResource($previewData)
            );
        } catch (Exception $e) {
            Log::error('Failed to preview group order checkout: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function unlock(UnlockGroupOrderRequest $request): JsonResponse
    {
        try {
            $dto = UnlockGroupOrderDto::fromValidatedRequest($request);

            $this->groupOrderApplicationService->unlock($dto);

            return $this->successResponse(
                trans('group_order.unlocked_successfully') ?? 'Group order unlocked successfully'
            );
        } catch (Exception $e) {
            Log::error('Failed to unlock group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function cancel(CancelGroupOrderRequest $request): JsonResponse
    {
        try {
            $dto = CancelGroupOrderDto::fromValidatedRequest($request);

            $this->groupOrderApplicationService->cancel($dto);

            return $this->successResponse(
                trans('group_order.cancelled_successfully') ?? 'Group order cancelled successfully'
            );
        } catch (Exception $e) {
            Log::error('Failed to cancel group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function placeOrder(PlaceGroupOrderRequest $request): JsonResponse
    {
        try {
            $dto = PlaceGroupOrderDto::fromValidatedRequest($request);

            $result = $this->groupOrderApplicationService->placeOrder($dto);

            return $this->successResponse(
                trans('group_order.placed_successfully') ?? 'Group order placed successfully',
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to place group order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function history(GroupOrderHistoryRequest $request): JsonResponse
    {
        try {
            $dto = GroupOrderHistoryDto::fromValidatedRequest($request);

            $orders = $this->groupOrderApplicationService->getHistory($dto);

            $items = GroupOrderResource::collection($orders->items());

            return $this->successResponse(
                trans('group_order.retrieved_successfully') ?? 'Group orders retrieved successfully',
                [
                    'items' => $items,
                    'meta'  => [
                        'current_page' => $orders->currentPage(),
                        'last_page'    => $orders->lastPage(),
                        'per_page'     => $orders->perPage(),
                        'total'        => $orders->total(),
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve group order history: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function activeSessions(ActiveGroupOrdersRequest $request): JsonResponse
    {
        try {
            $dto = ActiveGroupOrdersDto::fromValidatedRequest($request);

            $orders = $this->groupOrderApplicationService->getActiveSessions($dto);

            return $this->successResponse(
                trans('group_order.retrieved_successfully') ?? 'Active group orders retrieved successfully',
                GroupOrderSimpleResource::collection($orders)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve active group order sessions: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
