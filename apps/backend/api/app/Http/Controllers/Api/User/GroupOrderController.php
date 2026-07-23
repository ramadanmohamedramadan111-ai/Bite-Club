<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\GroupOrder\CreateGroupOrderRequest;
use App\DTOs\User\GroupOrder\CreateGroupOrderDto;
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
}
