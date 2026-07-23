<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\GroupOrder\CreateGroupOrderRequest;
use App\Http\Requests\User\GroupOrder\AddGroupOrderItemRequest;
use App\DTOs\User\GroupOrder\CreateGroupOrderDto;
use App\DTOs\User\GroupOrder\AddGroupOrderItemDto;
use App\Services\Application\User\GroupOrder\GroupOrderApplicationService;
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
}
