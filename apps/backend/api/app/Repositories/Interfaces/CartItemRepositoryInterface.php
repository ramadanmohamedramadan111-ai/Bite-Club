<?php

namespace App\Repositories\Interfaces;

use App\Models\CartItem;

interface CartItemRepositoryInterface extends BaseRepositoryInterface
{
    public function updateOrCreateItem(int $cartId, array $data): CartItem;
}
