<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\User\Cart\AddItemToCartRequest;
use App\Http\Requests\User\Cart\ListCartsRequest;
use App\DTOs\User\Cart\AddItemToCartDto;
use App\DTOs\User\Cart\ListCartsDto;
use App\DTOs\User\Cart\UpdateCartItemQuantityDto;
use App\DTOs\User\Cart\RemoveCartItemDto;
use App\Http\Requests\User\Cart\UpdateCartItemQuantityRequest;
use App\Http\Requests\User\Cart\RemoveCartItemRequest;
use App\Services\Application\User\Cart\CartApplicationService;
use App\Http\Resources\User\Cart\CartResource;
use Exception;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    public function __construct(
        private readonly CartApplicationService $cartApplicationService
    ) {}

    public function addItem(AddItemToCartRequest $request): JsonResponse
    {
        try {
            $dto = AddItemToCartDto::fromValidatedRequest($request);
            $this->cartApplicationService->addItem($dto);

            return $this->successResponse(
                trans('cart.item_added_successfully')
            );
        } catch (Exception $e) {
            Log::error('Failed to add item to cart: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function index(ListCartsRequest $request): JsonResponse
    {
        try {
            $dto = ListCartsDto::fromValidatedRequest($request);
            $carts = $this->cartApplicationService->listCarts($dto);

            return $this->successResponse(
                'Carts retrieved successfully.',
                CartResource::collection($carts)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve carts: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function updateItemQuantity(UpdateCartItemQuantityRequest $request): JsonResponse
    {
        try {
            $dto = UpdateCartItemQuantityDto::fromValidatedRequest($request);
            $this->cartApplicationService->updateItemQuantity($dto);

            return $this->successResponse(
                'Cart item updated successfully.'
            );
        } catch (Exception $e) {
            Log::error('Failed to update cart item: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function removeItem(RemoveCartItemRequest $request): JsonResponse
    {
        try {
            $dto = RemoveCartItemDto::fromValidatedRequest($request);
            $this->cartApplicationService->removeItem($dto);

            return $this->successResponse(
                'Cart item removed successfully.'
            );
        } catch (Exception $e) {
            Log::error('Failed to remove cart item: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
