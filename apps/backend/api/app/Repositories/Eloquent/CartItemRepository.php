<?php

namespace App\Repositories\Eloquent;

use App\Models\CartItem;
use App\Repositories\Interfaces\CartItemRepositoryInterface;

class CartItemRepository extends BaseRepository implements CartItemRepositoryInterface
{
    public function __construct(CartItem $model)
    {
        parent::__construct($model);
    }

    public function updateOrCreateItem(int $cartId, array $itemData): CartItem
    {
        $cartItem = $this->model->where('cart_id', $cartId)
            ->where('item_id', $itemData['item_id'])
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $itemData['quantity'];
            $cartItem->unit_price = $itemData['unit_price'];
            $cartItem->notes = $itemData['notes'] ?? $cartItem->notes;
            $cartItem->save();
            return $cartItem;
        }

        return $this->model->create([
            'cart_id'    => $cartId,
            'item_id'    => $itemData['item_id'],
            'item_name'  => $itemData['item_name'],
            'quantity'   => $itemData['quantity'],
            'unit_price' => $itemData['unit_price'],
            'notes'      => $itemData['notes'] ?? null,
        ]);
    }
}
