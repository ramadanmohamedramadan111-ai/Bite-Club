<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Social\CreatePostRequest;
use App\Http\Requests\Social\LikePostRequest;
use App\Http\Requests\Social\CopyOrderRequest;
use App\DTOs\Social\CreatePostDto;
use App\DTOs\Social\LikePostDto;
use App\DTOs\Social\CopyOrderDto;
use App\Services\Application\Social\PostApplicationService;
use App\Http\Resources\Social\PostResource;
use App\Http\Resources\Social\PostDetailResource;
use Exception;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    public function __construct(
        private readonly PostApplicationService $postApplicationService
    ) {}

    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        try {
            $userId = auth('user')->id();
            $perPage = (int) $request->query('per_page', 15);
            $posts = $this->postApplicationService->getFeedPosts($userId, $perPage);

            return $this->successResponse(
                'Feed posts retrieved successfully.',
                [
                    'items' => PostResource::collection($posts->items()),
                    'meta'  => [
                        'current_page' => $posts->currentPage(),
                        'per_page'     => $posts->perPage(),
                        'total'        => $posts->total(),
                        'last_page'    => $posts->lastPage(),
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve feed posts: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function store(CreatePostRequest $request): JsonResponse
    {
        try {
            $dto = CreatePostDto::fromValidatedRequest($request);
            $post = $this->postApplicationService->createPost($dto);

            return $this->successResponse(
                'Post created successfully and pending review.',
                new PostDetailResource($post),
                201
            );
        } catch (Exception $e) {
            Log::error('Failed to create post: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $userId = auth('user')->id();
            $post = $this->postApplicationService->getPostDetails($id, $userId);

            return $this->successResponse(
                'Post details retrieved successfully.',
                new PostDetailResource($post)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve post details: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 404);
        }
    }

    public function like(LikePostRequest $request): JsonResponse
    {
        try {
            $dto = LikePostDto::fromValidatedRequest($request);
            $likesCount = $this->postApplicationService->likePost($dto);

            return $this->successResponse(
                'Post liked successfully.',
                ['likes_count' => $likesCount]
            );
        } catch (Exception $e) {
            Log::error('Failed to like post: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function unlike(LikePostRequest $request): JsonResponse
    {
        try {
            $dto = LikePostDto::fromValidatedRequest($request);
            $likesCount = $this->postApplicationService->unlikePost($dto);

            return $this->successResponse(
                'Post unliked successfully.',
                ['likes_count' => $likesCount]
            );
        } catch (Exception $e) {
            Log::error('Failed to unlike post: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function copyOrder(CopyOrderRequest $request): JsonResponse
    {
        try {
            $dto = CopyOrderDto::fromValidatedRequest($request);
            $result = $this->postApplicationService->copyOrder($dto);
            $cart = $result['cart'];
            $orderCopy = $result['order_copy'];

            return $this->successResponse(
                'Order copied successfully into a new cart.',
                [
                    'copy_id'  => $orderCopy->id,
                    'status'   => $orderCopy->status->value ?? $orderCopy->status,
                    'cart_id'  => $cart->id,
                    'cart'     => new \App\Http\Resources\User\Cart\CartResource($cart),
                ],
                201
            );
        } catch (Exception $e) {
            Log::error('Failed to copy order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function completeCopiedOrder(int $copiedOrderId): JsonResponse
    {
        try {
            $orderCopy = $this->postApplicationService->completeCopiedOrder($copiedOrderId);

            if (!$orderCopy) {
                return $this->errorResponse('Copied order not found.', [], 404);
            }

            return $this->successResponse(
                'Copied order completed successfully.',
                [
                    'copy_id'      => $orderCopy->id,
                    'status'       => $orderCopy->status->value ?? $orderCopy->status,
                    'completed_at' => $orderCopy->completed_at?->toIso8601String(),
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to complete copied order: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function myPosts(\Illuminate\Http\Request $request): JsonResponse
    {
        try {
            $userId = auth('user')->id();
            $perPage = (int) $request->query('per_page', 15);
            $posts = $this->postApplicationService->getUserPosts($userId, $perPage);

            return $this->successResponse(
                'My posts retrieved successfully.',
                [
                    'items' => PostResource::collection($posts->items()),
                    'meta'  => [
                        'current_page' => $posts->currentPage(),
                        'per_page'     => $posts->perPage(),
                        'total'        => $posts->total(),
                        'last_page'    => $posts->lastPage(),
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve my posts: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function shareableOrders(): JsonResponse
    {
        try {
            $userId = auth('user')->id();

            // Get IDs of orders that have already been posted by the user
            $postedOrderIds = \App\Models\Post::where('user_id', $userId)
                ->pluck('order_id')
                ->toArray();

            // Fetch completed orders not in the posted list
            $orders = \App\Models\Order::with(['restaurant', 'items', 'payments'])
                ->where('user_id', $userId)
                ->where('status', \App\Enums\Order\OrderStatusEnum::COMPLETED->value)
                ->whereNotIn('id', $postedOrderIds)
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->successResponse(
                'Shareable orders retrieved successfully.',
                \App\Http\Resources\User\Order\UserOrderResource::collection($orders)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve shareable user orders: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
