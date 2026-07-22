<?php

namespace App\Http\Controllers\Api\Admin\UserManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserManagement\IndexUserBanRequest;
use App\DTOs\Admin\UserManagement\IndexUserBanDto;
use App\Http\Requests\Admin\UserManagement\CreateUserBanRequest;
use App\DTOs\Admin\UserManagement\CreateUserBanDto;
use App\Http\Requests\Admin\UserManagement\LiftUserBanRequest;
use App\DTOs\Admin\UserManagement\LiftUserBanDto;
use App\Services\Application\Admin\UserManagement\UserBanApplicationService;
use App\Http\Resources\Admin\UserManagement\UserBanResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Exception;

class UserBanController extends Controller
{
    public function __construct(
        private readonly UserBanApplicationService $userBanApplicationService
    ) {}

    public function index(IndexUserBanRequest $request): JsonResponse
    {
        try {
            $dto = IndexUserBanDto::fromValidatedRequest($request);
            $result = $this->userBanApplicationService->index($dto);

            return $this->successResponse(
                'Active user bans retrieved successfully.',
                [
                    'items' => UserBanResource::collection($result['items']),
                    'meta'  => $result['meta'],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to list user bans: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve user bans.');
        }
    }

    public function store(CreateUserBanRequest $request): JsonResponse
    {
        try {
            $dto = CreateUserBanDto::fromValidatedRequest($request);
            $adminId = Auth::guard('admin')->id();

            $ban = $this->userBanApplicationService->ban($dto, $adminId);

            return $this->createdResponse(
                'User banned successfully.',
                new UserBanResource($ban)
            );
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        } catch (Exception $e) {
            Log::error('Failed to ban user: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to ban user.');
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $ban = $this->userBanApplicationService->show($id);

            return $this->successResponse(
                'User ban details retrieved successfully.',
                new UserBanResource($ban)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('User ban record not found.');
        } catch (Exception $e) {
            Log::error('Failed to retrieve user ban details: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve user ban details.');
        }
    }

    public function lift(int $id, LiftUserBanRequest $request): JsonResponse
    {
        try {
            $dto = LiftUserBanDto::fromValidatedRequest($request);
            $adminId = Auth::guard('admin')->id();

            $ban = $this->userBanApplicationService->lift($id, $dto, $adminId);

            return $this->successResponse(
                'User ban lifted successfully.',
                new UserBanResource($ban)
            );
        } catch (DomainException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('User ban record not found.');
        } catch (Exception $e) {
            Log::error('Failed to lift user ban: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to lift user ban.');
        }
    }
}
