<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\User\UpdateProfileRequest;
use App\DTOs\User\UpdateProfileDto;
use App\Services\Application\User\UserApplicationService;
use App\Http\Resources\User\UserResource;
use Exception;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function __construct(
        private readonly UserApplicationService $userApplicationService
    ) {}

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = auth('user')->user();
            $dto = UpdateProfileDto::fromValidatedRequest($request);
            $updatedUser = $this->userApplicationService->updateProfile($user, $dto);

            return $this->successResponse(
                'Profile updated successfully.',
                (new UserResource($updatedUser))->resolve()
            );
        } catch (Exception $e) {
            Log::error('Failed to update profile: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
