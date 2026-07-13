<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\DTOs\Auth\UserLoginDto;
use App\DTOs\Auth\UserRegisterDto;
use App\DTOs\Auth\ForgotPasswordDto;
use App\DTOs\Auth\VerifyResetOtpDto;
use App\DTOs\Auth\ResetPasswordDto;
use App\Http\Requests\Auth\UserLoginRequest;
use App\Http\Requests\Auth\UserRegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\VerifyResetOtpRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\Application\Auth\UserAuthApplicationService;

class UserAuthController extends Controller
{
    public function __construct(
        private UserAuthApplicationService $userAuthApplicationService
    ) {}

    public function register(UserRegisterRequest $request): JsonResponse
    {
        try {

            $dto = UserRegisterDto::fromValidatedRequest($request);

            $this->userAuthApplicationService->register($dto);

            return $this->createdResponse(
                'Verification email sent successfully.'
            );
        } catch (Exception $e) {

            Log::error('User register failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->errorResponse($e->getMessage());
        }
    }

    public function verifyEmail(Request $request, $id, $hash): JsonResponse
    {
        try {
            $this->userAuthApplicationService->verifyEmail(
                (int) $id,
                (string) $hash,
                $request->hasValidSignature()
            );

            return $this->successResponse(
                'Email verified successfully.'
            );
        } catch (Exception $e) {
            Log::error('Email verification failed: ' . $e->getMessage(), [
                'id' => $id,
            ]);

            return $this->errorResponse($e->getMessage());
        }
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $dto = ForgotPasswordDto::fromValidatedRequest($request);

            $this->userAuthApplicationService->forgotPassword($dto);

            return $this->successResponse(
                'OTP sent successfully.'
            );
        } catch (Exception $e) {
            Log::error('Forgot password failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->errorResponse($e->getMessage());
        }
    }

    public function verifyResetOtp(VerifyResetOtpRequest $request): JsonResponse
    {
        try {
            $dto = VerifyResetOtpDto::fromValidatedRequest($request);

            $this->userAuthApplicationService->verifyResetOtp($dto);

            return $this->successResponse(
                'OTP verified successfully.'
            );
        } catch (Exception $e) {
            Log::error('Verify reset OTP failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->errorResponse($e->getMessage());
        }
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $dto = ResetPasswordDto::fromValidatedRequest($request);

            $this->userAuthApplicationService->resetPassword($dto);

            return $this->successResponse(
                'Password reset successfully.'
            );
        } catch (Exception $e) {
            Log::error('Reset password failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->errorResponse($e->getMessage());
        }
    }

    public function login(UserLoginRequest $request): JsonResponse
    {
        try {
            $dto = UserLoginDto::fromValidatedRequest($request);

            $result = $this->userAuthApplicationService->login($dto);

            return $this->successResponse(
                trans('auth.login_success'),
                $result
            );
        } catch (Exception $e) {

            Log::error('User login failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->unauthorizedResponse($e->getMessage());
        }
    }

    public function logout(): JsonResponse
    {
        try {
            $this->userAuthApplicationService->logout();

            return $this->successResponse(
                trans('auth.logout_success')
            );
        } catch (Exception $e) {

            Log::error('User logout failed: ' . $e->getMessage());

            return $this->serverErrorResponse(
                trans('auth.logout_failed')
            );
        }
    }

    public function refresh(): JsonResponse
    {
        try {
            $result = $this->userAuthApplicationService->refresh();

            return $this->successResponse(
                trans('auth.refresh_success'),
                $result
            );
        } catch (Exception $e) {

            return $this->unauthorizedResponse(
                trans('auth.refresh_failed')
            );
        }
    }

    public function me(): JsonResponse
    {
        try {
            $data = $this->userAuthApplicationService->me();

            return $this->successResponse(
                null,
                $data
            );
        } catch (Exception $e) {

            return $this->serverErrorResponse(
                trans('auth.me_failed')
            );
        }
    }
}
