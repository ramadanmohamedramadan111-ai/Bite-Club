<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\DTOs\Auth\AdminLoginDto;
use App\Http\Requests\Auth\AdminLoginRequest;
use App\Services\Application\Auth\AdminAuthApplicationService;
use Illuminate\Support\Facades\Log;

class AdminAuthController extends Controller
{
    public function __construct(
        private AdminAuthApplicationService $adminAuthApplicationService
    ) {}

    public function login(AdminLoginRequest $request): JsonResponse
    {
        try {
            $dto    = AdminLoginDto::fromValidatedRequest($request);
            $result = $this->adminAuthApplicationService->login($dto);

            return $this->successResponse(
                trans('auth.login_success'),
                $result
            );

        } catch (Exception $e) {
            Log::error('Admin login failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->unauthorizedResponse($e->getMessage());
        }
    }

    public function logout(): JsonResponse
    {
        try {
            $this->adminAuthApplicationService->logout();

            return $this->successResponse(trans('auth.logout_success'));

        } catch (Exception $e) {
            Log::error('Admin logout failed: ' . $e->getMessage());

            return $this->serverErrorResponse(trans('auth.logout_failed'));
        }
    }

    public function refresh(): JsonResponse
    {
        try {
            $result = $this->adminAuthApplicationService->refresh();

            return $this->successResponse(
                trans('auth.refresh_success'),
                $result
            );

        } catch (Exception $e) {
            return $this->unauthorizedResponse(trans('auth.refresh_failed'));
        }
    }

    public function me(): JsonResponse
    {
        try {
            $data = $this->adminAuthApplicationService->me();

            return $this->successResponse(null, $data);

        } catch (Exception $e) {
            return $this->serverErrorResponse(trans('auth.me_failed'));
        }
    }
}
