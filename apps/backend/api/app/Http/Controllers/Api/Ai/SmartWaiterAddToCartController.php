<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SmartWaiterAddToCartController extends Controller
{
    use ApiResponseTrait;

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'restaurant_id' => ['nullable', 'integer', 'exists:restaurants,id'],
                'items' => ['required', 'array', 'min:1'],
                'items.*.id' => ['required', 'integer', 'exists:items,id'],
                'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            ]);
        } catch (ValidationException $exception) {
            return $this->errorResponse(null, $exception->errors(), 422);
        }

        $user = Auth::guard('user')->user() ?? Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated user. Bearer token is required.');
        }

        // Resolve restaurant_id
        $restaurantId = $validated['restaurant_id'] ?? null;

        if (!$restaurantId) {
            $restaurantId = Cart::where('user_id', $user->id)->value('restaurant_id');
        }

        if (!$restaurantId) {
            $firstItemId = $validated['items'][0]['id'] ?? null;
            if ($firstItemId) {
                $firstMenuItem = MenuItem::with('menu_category')->find($firstItemId);
                $restaurantId = $firstMenuItem?->menu_category?->restaurant_id;
            }
        }

        if (!$restaurantId) {
            $restaurantId = Order::where('user_id', $user->id)->latest()->value('restaurant_id');
        }

        if (!$restaurantId) {
            $restaurantId = Restaurant::query()->where('status', 'active')->value('id') ?? Restaurant::query()->value('id');
        }

        $restaurant = Restaurant::find($restaurantId);
        if (!$restaurant) {
            return $this->notFoundResponse('Restaurant not found');
        }

        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id, 'group_order_id' => null],
            ['restaurant_id' => $restaurant->id]
        );

        // Always replace the cart completely with the AI's recommendations
        $cart->items()->delete();
        $cart->update(['restaurant_id' => $restaurant->id]);

        $addedItems = [];
        $totalPrice = 0.0;

        foreach ($validated['items'] as $itemData) {
            $itemId = $itemData['id'];
            $qty = max((int) ($itemData['quantity'] ?? 1), 1);

            $menuItem = MenuItem::find($itemId);
            if ($menuItem) {
                $existingItem = $cart->items()->where('item_id', $menuItem->id)->first();
                if ($existingItem) {
                    $existingItem->increment('quantity', $qty);
                } else {
                    $cart->items()->create([
                        'item_id' => $menuItem->id,
                        'item_name' => $menuItem->title,
                        'quantity' => $qty,
                        'unit_price' => $menuItem->price,
                    ]);
                }

                $itemTotal = (float) ($menuItem->price * $qty);
                $totalPrice += $itemTotal;

                $addedItems[] = [
                    'id' => $menuItem->id,
                    'name' => $menuItem->title,
                    'price' => (float) $menuItem->price,
                    'quantity' => $qty,
                ];
            }
        }

        return $this->successResponse('Recommended items added to your cart successfully!', [
            'cart_updated' => true,
            'cart_item_count' => (int) $cart->items()->sum('quantity'),
            'total_price' => (float) $totalPrice,
            'restaurant_id' => $restaurant->id,
            'restaurant_name' => $restaurant->name,
            'added_items' => $addedItems,
        ]);
    }
}
