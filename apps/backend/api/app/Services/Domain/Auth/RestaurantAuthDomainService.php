<?php

namespace App\Services\Domain\Auth;

use Exception;
use App\Models\Restaurant;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class RestaurantAuthDomainService
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository
    ) {}

    private function guard(): JWTGuard
    {
        return Auth::guard('restaurant');
    }

    public function register(array $data): Restaurant
    {
        return $this->restaurantRepository->create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'phone_number'  => $data['phone_number'],
            'address'       => $data['address'],
            'category_id'   => $data['category_id'] ?? null,
            'description'   => $data['description'] ?? null,
            'status'        => RestaurantStatusEnum::PENDING_APPROVAL->value,
        ]);
    }

    public function attemptLogin(string $email, string $password): string
    {
        $token = $this->guard()->attempt([
            'email'    => $email,
            'password' => $password,
        ]);

        if (!$token) {
            throw new Exception(trans('restaurant_auth.failed'));
        }

        $restaurant = $this->getAuthenticatedRestaurant();

        match($restaurant->status) {
            RestaurantStatusEnum::PENDING_APPROVAL => throw new Exception(trans('restaurant_auth.pending')),
            RestaurantStatusEnum::SUSPENDED        => throw new Exception(trans('restaurant_auth.suspended')),
            RestaurantStatusEnum::CLOSED           => throw new Exception(trans('restaurant_auth.closed')),
            RestaurantStatusEnum::REJECTED         => throw new Exception(trans('restaurant_auth.rejected')),
            default                                => null,
        };

        return $token;
    }

    public function logout(): void
    {
        $this->guard()->logout();
    }

    public function refresh(): string
    {
        $token = $this->guard()->refresh();

        if (!$token) {
            throw new Exception(trans('restaurant_auth.refresh_failed'));
        }

        return $token;
    }

    public function getAuthenticatedRestaurant(): Restaurant
    {
        $restaurant = $this->guard()->user();

        if (!$restaurant instanceof Restaurant) {
            throw new Exception(trans('restaurant_auth.unauthorized'));
        }

        return $restaurant;
    }
}
