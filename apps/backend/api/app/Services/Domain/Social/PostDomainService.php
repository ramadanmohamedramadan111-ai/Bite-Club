<?php

namespace App\Services\Domain\Social;

use App\Models\Post;
use App\Models\Order;
use App\Models\PostImage;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Social\PostStatusEnum;
use App\Traits\FileUploadTrait;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PostDomainService
{
    use FileUploadTrait;

    public function createPost(int $userId, int $orderId, ?string $caption, array $images = []): Post
    {
        $order = Order::find($orderId);

        if (!$order) {
            throw new Exception(trans('social.order_not_found') ?? 'Order not found.');
        }

        if ($order->user_id !== $userId) {
            throw new Exception(trans('social.order_owner_mismatch') ?? 'You can only share your own orders.');
        }

        if ($order->status->value !== OrderStatusEnum::COMPLETED->value && $order->status !== OrderStatusEnum::COMPLETED) {
            throw new Exception(trans('social.incomplete_order') ?? 'Only completed orders can be shared.');
        }

        $existingPost = Post::where('order_id', $orderId)->exists();
        if ($existingPost) {
            throw new Exception(trans('social.order_already_posted') ?? 'This order has already been shared.');
        }

        return DB::transaction(function () use ($userId, $order, $caption, $images) {
            $post = Post::create([
                'user_id'       => $userId,
                'restaurant_id' => $order->restaurant_id,
                'order_id'      => $order->id,
                'caption'       => $caption,
                'status'        => PostStatusEnum::PENDING->value,
                'likes_count'   => 0,
                'copy_count'    => 0,
            ]);

            foreach ($images as $index => $image) {
                $imageUrl = $image;
                if ($image instanceof UploadedFile) {
                    $imageUrl = $this->uploadFile($image, 'posts');
                }

                PostImage::create([
                    'post_id'   => $post->id,
                    'image_url' => $imageUrl,
                    'position'  => $index,
                ]);
            }

            return $post->load(['user', 'restaurant', 'images', 'order']);
        });
    }

    public function getFeedPosts(?int $currentUserId = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Post::with(['user', 'restaurant', 'images', 'order.items'])
            ->where('status', PostStatusEnum::APPROVED->value)
            ->where('expires_at', '>', now())
            ->orderBy('published_at', 'desc');

        if ($currentUserId) {
            $query->withExists(['likes as is_liked_by_user' => function ($q) use ($currentUserId) {
                $q->where('user_id', $currentUserId);
            }]);
        }

        return $query->paginate($perPage);
    }

    public function getPostDetails(int $postId, ?int $currentUserId = null): Post
    {
        $query = Post::with(['user', 'restaurant', 'images', 'order.items']);

        if ($currentUserId) {
            $query->withExists(['likes as is_liked_by_user' => function ($q) use ($currentUserId) {
                $q->where('user_id', $currentUserId);
            }]);
        }

        $post = $query->find($postId);

        if (!$post) {
            throw new Exception(trans('social.post_not_found') ?? 'Post not found.');
        }

        return $post;
    }

    public function getAdminPosts(?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Post::with(['user', 'restaurant', 'images', 'order.items', 'reviewer'])
            ->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    public function approvePost(int $postId, int $adminId): Post
    {
        $post = Post::findOrFail($postId);

        $now = now();
        $post->update([
            'status'       => PostStatusEnum::APPROVED->value,
            'published_at' => $now,
            'expires_at'   => $now->copy()->addDays(7),
            'reviewed_at'  => $now,
            'reviewed_by'  => $adminId,
            'rejection_reason' => null,
        ]);

        return $post->fresh(['user', 'restaurant', 'images', 'order']);
    }

    public function rejectPost(int $postId, int $adminId, ?string $reason): Post
    {
        $post = Post::findOrFail($postId);

        $post->update([
            'status'           => PostStatusEnum::REJECTED->value,
            'reviewed_at'      => now(),
            'reviewed_by'      => $adminId,
            'rejection_reason' => $reason,
        ]);

        return $post->fresh(['user', 'restaurant', 'images', 'order']);
    }
}
