<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\User\Cart\AddItemToCartRequest;
use App\DTOs\User\Cart\AddItemToCartDto;
use App\Services\Application\User\Cart\CartApplicationService;
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
}
