<?php

namespace App\Http\Controllers\Api\Admin\UserManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserManagement\IndexUserRequest;
use App\DTOs\Admin\UserManagement\IndexUserDto;
use App\Services\Application\Admin\UserManagement\UserApplicationService;
use App\Http\Resources\Admin\UserManagement\UserListResource;
use App\Http\Resources\Admin\UserManagement\UserDetailResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class UserController extends Controller
{
    public function __construct(
        private readonly UserApplicationService $userApplicationService
    ) {}

    public function index(IndexUserRequest $request): JsonResponse
    {
        try {
            $dto = IndexUserDto::fromValidatedRequest($request);
            $result = $this->userApplicationService->index($dto);

            return $this->successResponse(
                'Users retrieved successfully.',
                [
                    'items' => UserListResource::collection($result['items']),
                    'meta'  => $result['meta'],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to list users: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve users list.');
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $user = $this->userApplicationService->show($id);

            return $this->successResponse(
                'User details retrieved successfully.',
                new UserDetailResource($user)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('User not found.');
        } catch (Exception $e) {
            Log::error('Failed to retrieve user: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve user details.');
        }
    }

    public function stats(): JsonResponse
    {
        try {
            $stats = $this->userApplicationService->stats();

            return $this->successResponse(
                'User statistics retrieved successfully.',
                $stats
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve user stats: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve user statistics.');
        }
    }
}
