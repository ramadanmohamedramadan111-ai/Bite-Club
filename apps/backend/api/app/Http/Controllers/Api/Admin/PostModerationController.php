<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\Social\ApprovePostRequest;
use App\Http\Requests\Admin\Social\RejectPostRequest;
use App\DTOs\Social\ApprovePostDto;
use App\DTOs\Social\RejectPostDto;
use App\Services\Application\Admin\Social\AdminPostApplicationService;
use App\Http\Resources\Social\AdminPostResource;
use Exception;
use Illuminate\Support\Facades\Log;

class PostModerationController extends Controller
{
    public function __construct(
        private readonly AdminPostApplicationService $adminPostApplicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $status = $request->query('status');
            $perPage = (int) $request->query('per_page', 15);
            $posts = $this->adminPostApplicationService->getAdminPosts($status, $perPage);

            return $this->successResponse(
                'Posts retrieved successfully for admin review.',
                [
                    'items' => AdminPostResource::collection($posts->items()),
                    'meta'  => [
                        'current_page' => $posts->currentPage(),
                        'per_page'     => $posts->perPage(),
                        'total'        => $posts->total(),
                        'last_page'    => $posts->lastPage(),
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve admin posts: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function approve(ApprovePostRequest $request): JsonResponse
    {
        try {
            $dto = ApprovePostDto::fromValidatedRequest($request);
            $post = $this->adminPostApplicationService->approvePost($dto);

            return $this->successResponse(
                'Post approved successfully.',
                new AdminPostResource($post)
            );
        } catch (Exception $e) {
            Log::error('Failed to approve post: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }

    public function reject(RejectPostRequest $request): JsonResponse
    {
        try {
            $dto = RejectPostDto::fromValidatedRequest($request);
            $post = $this->adminPostApplicationService->rejectPost($dto);

            return $this->successResponse(
                'Post rejected successfully.',
                new AdminPostResource($post)
            );
        } catch (Exception $e) {
            Log::error('Failed to reject post: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
