<?php

namespace App\Services\Domain\Social;

use App\Models\Post;
use App\Models\Order;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\OrderCopy;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Social\OrderCopyStatusEnum;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderCopyDomainService
{
    public function copyOrder(int $postId, int $userId): array
    {
        $post = Post::with('order.items')->find($postId);

        if (!$post) {
            throw new Exception(trans('social.post_not_found') ?? 'Post not found.');
        }

        if (!$post->isActiveFeedPost()) {
            throw new Exception(trans('social.cannot_copy_post') ?? 'Cannot copy pending, rejected, or expired posts.');
        }

        $originalOrder = $post->order;

        if (!$originalOrder) {
            throw new Exception(trans('social.original_order_not_found') ?? 'Original order not found.');
        }

        return DB::transaction(function () use ($post, $originalOrder, $userId) {
            // Delete existing cart for user if exists
            $existingCart = Cart::where('user_id', $userId)->first();
            if ($existingCart) {
                $existingCart->items()->delete();
                $existingCart->delete();
            }

            // Create new cart for copied order's restaurant
            $cart = Cart::create([
                'user_id'       => $userId,
                'restaurant_id' => $originalOrder->restaurant_id,
            ]);

            foreach ($originalOrder->items as $item) {
                CartItem::create([
                    'cart_id'    => $cart->id,
                    'item_id'    => $item->item_id,
                    'item_name'  => $item->item_name,
                    'quantity'   => $item->quantity,
                    'unit_price' => $item->price,
                    'notes'      => $item->notes,
                ]);
            }

            $orderCopy = OrderCopy::create([
                'post_id'           => $post->id,
                'original_order_id' => $originalOrder->id,
                'copied_order_id'   => null,
                'copied_by_user_id' => $userId,
                'status'            => OrderCopyStatusEnum::PENDING->value,
            ]);

            return [
                'cart'       => $cart->load(['items', 'restaurant']),
                'order_copy' => $orderCopy,
            ];
        });
    }

    public function completeCopiedOrder(int $copiedOrderId, ?int $copyId = null): ?OrderCopy
    {
        $query = OrderCopy::query();

        if ($copyId) {
            $query->where('id', $copyId);
        } else {
            $query->where('copied_order_id', $copiedOrderId)
                ->orWhere(fn ($q) => $q->whereNull('copied_order_id')->where('status', OrderCopyStatusEnum::PENDING->value));
        }

        $orderCopy = $query->first();

        if (!$orderCopy) {
            return null;
        }

        if ($orderCopy->status->value === OrderCopyStatusEnum::COMPLETED->value || $orderCopy->status === OrderCopyStatusEnum::COMPLETED) {
            return $orderCopy;
        }

        return DB::transaction(function () use ($orderCopy, $copiedOrderId) {
            $orderCopy->update([
                'copied_order_id' => $copiedOrderId,
                'status'          => OrderCopyStatusEnum::COMPLETED->value,
                'completed_at'    => now(),
            ]);

            $order = Order::find($copiedOrderId);
            if ($order && $order->status->value !== OrderStatusEnum::COMPLETED->value) {
                $order->update(['status' => OrderStatusEnum::COMPLETED->value]);
            }

            $post = $orderCopy->post;
            if ($post) {
                $post->increment('copy_count');
            }

            return $orderCopy->fresh(['post', 'copiedOrder']);
        });
    }

    public function cancelCopiedOrder(int $copiedOrderId): ?OrderCopy
    {
        $orderCopy = OrderCopy::where('copied_order_id', $copiedOrderId)->first();

        if (!$orderCopy) {
            return null;
        }

        return DB::transaction(function () use ($orderCopy) {
            $orderCopy->update([
                'status' => OrderCopyStatusEnum::CANCELLED->value,
            ]);

            $order = $orderCopy->copiedOrder;
            if ($order && $order->status->value !== OrderStatusEnum::CANCELLED->value) {
                $order->update(['status' => OrderStatusEnum::CANCELLED->value]);
            }

            return $orderCopy->fresh();
        });
    }
}
