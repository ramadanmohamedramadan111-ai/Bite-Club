<?php

namespace App\Http\Controllers\Api\Auth;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\DTOs\Auth\Restaurant\RestaurantLoginDto;
use App\DTOs\Auth\Restaurant\RestaurantRegisterDto;
use App\Http\Requests\Auth\Restaurant\RestaurantLoginRequest;
use App\Http\Requests\Auth\Restaurant\RestaurantRegisterRequest;
use App\Services\Application\Auth\RestaurantAuthApplicationService;

class RestaurantAuthController extends Controller
{
    public function __construct(
        private RestaurantAuthApplicationService $restaurantAuthApplicationService
    ) {}

    public function register(RestaurantRegisterRequest $request): JsonResponse
    {
        try {
            $dto    = RestaurantRegisterDto::fromValidatedRequest($request);
            $result = $this->restaurantAuthApplicationService->register($dto);

            return $this->createdResponse(
                trans('restaurant_auth.register_success'),
                $result
            );

        } catch (Exception $e) {
            Log::error('Restaurant registration failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->serverErrorResponse(trans('restaurant_auth.register_failed'));
        }
    }

    public function login(RestaurantLoginRequest $request): JsonResponse
    {
        try {
            $dto    = RestaurantLoginDto::fromValidatedRequest($request);
            $result = $this->restaurantAuthApplicationService->login($dto);

            return $this->successResponse(
                trans('restaurant_auth.login_success'),
                $result
            );

        } catch (Exception $e) {
            Log::error('Restaurant login failed: ' . $e->getMessage(), [
                'email' => $request->input('email'),
            ]);

            return $this->unauthorizedResponse($e->getMessage());
        }
    }

    public function logout(): JsonResponse
    {
        try {
            $this->restaurantAuthApplicationService->logout();

            return $this->successResponse(trans('restaurant_auth.logout_success'));

        } catch (Exception $e) {
            Log::error('Restaurant logout failed: ' . $e->getMessage());

            return $this->serverErrorResponse(trans('restaurant_auth.logout_failed'));
        }
    }

    public function refresh(): JsonResponse
    {
        try {
            $result = $this->restaurantAuthApplicationService->refresh();

            return $this->successResponse(
                trans('restaurant_auth.refresh_success'),
                $result
            );

        } catch (Exception $e) {
            return $this->unauthorizedResponse(trans('restaurant_auth.refresh_failed'));
        }
    }

    public function me(): JsonResponse
    {
        try {
            $data = $this->restaurantAuthApplicationService->me();

            return $this->successResponse(null, $data);

        } catch (Exception $e) {
            return $this->serverErrorResponse(trans('restaurant_auth.me_failed'));
        }
    }
}
