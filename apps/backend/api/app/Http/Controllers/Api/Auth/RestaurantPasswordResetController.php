<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\RestaurantAuth\ForgotPasswordRequest;
use App\Http\Requests\RestaurantAuth\ResetPasswordRequest;
use App\DTOs\RestaurantAuth\ForgotPasswordDto;
use App\DTOs\RestaurantAuth\ResetPasswordDto;
use App\Services\Application\Auth\RestaurantPasswordResetApplicationService;

class RestaurantPasswordResetController extends Controller
{
    public function __construct(
        private RestaurantPasswordResetApplicationService $applicationService
    ) {}

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $dto = ForgotPasswordDto::fromValidatedRequest($request);
            $status = $this->applicationService->forgotPassword($dto);

            return $this->successResponse(
                trans($status)
            );
        } catch (Exception $e) {
            Log::error('Failed to send reset password link for restaurant: ' . $e->getMessage(), $request->validated());
            
            // Password broker returns status constants like "passwords.user" or similar.
            return $this->errorResponse(
                $e->getMessage() !== 'passwords.user' ? trans($e->getMessage()) : trans('restaurant_auth.reset_link_failed'),
                null,
                400
            );
        }
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $dto = ResetPasswordDto::fromValidatedRequest($request);
            $status = $this->applicationService->resetPassword($dto);

            return $this->successResponse(
                trans($status)
            );
        } catch (Exception $e) {
            Log::error('Failed to reset restaurant password: ' . $e->getMessage(), $request->safe()->except('password'));
            
            return $this->errorResponse(
                trans($e->getMessage()),
                null,
                400
            );
        }
    }
}
