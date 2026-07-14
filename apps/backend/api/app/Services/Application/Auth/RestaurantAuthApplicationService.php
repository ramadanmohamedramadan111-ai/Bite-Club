<?php

namespace App\Services\Application\Auth;

use App\DTOs\Auth\Restaurant\RestaurantLoginDto;
use App\DTOs\Auth\Restaurant\RestaurantRegisterDto;
use App\Mail\RestaurantPendingMail;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use App\Services\Domain\Auth\RestaurantAuthDomainService;
use Illuminate\Support\Facades\Mail;

class RestaurantAuthApplicationService
{
    public function __construct(
        private RestaurantAuthDomainService   $restaurantAuthDomainService,
        private RestaurantRepositoryInterface $restaurantRepository,
    ) {}

    public function register(RestaurantRegisterDto $dto): array
    {
        $restaurant = $this->restaurantAuthDomainService->register([
            'name'         => $dto->getName(),
            'email'        => $dto->getEmail(),
            'password'     => $dto->getPassword(),
            'phone_number' => $dto->getPhoneNumber(),
            'address'      => $dto->getAddress(),
            'category_id'  => $dto->getCategoryId(),
            'description'  => $dto->getDescription(),
        ]);

        Mail::to($restaurant->email)->queue(new RestaurantPendingMail([
            'restaurant_name' => $restaurant->name,
        ]));

        return $this->mapRestaurant($restaurant);
    }

    public function login(RestaurantLoginDto $dto): array
    {
        $token = $this->restaurantAuthDomainService->attemptLogin(
            $dto->getEmail(),
            $dto->getPassword()
        );

        $restaurant = $this->restaurantAuthDomainService->getAuthenticatedRestaurant();


        return array_merge(
            $this->buildTokenResponse($token),
            ['restaurant' => $this->mapRestaurant($restaurant)]
        );
    }

    public function logout(): void
    {
        $this->restaurantAuthDomainService->logout();
    }

    public function refresh(): array
    {
        $token = $this->restaurantAuthDomainService->refresh();

        return $this->buildTokenResponse($token);
    }

    public function me(): array
    {
        $restaurant = $this->restaurantAuthDomainService->getAuthenticatedRestaurant();

        return $this->mapRestaurant($restaurant);
    }

    private function buildTokenResponse(string $token): array
    {
        return [
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl') * 60,
        ];
    }

    private function mapRestaurant($restaurant): array
    {
        return [
            'id'           => $restaurant->id,
            'name'         => $restaurant->name,
            'email'        => $restaurant->email,
            'phone_number' => $restaurant->phone_number,
            'address'      => $restaurant->address,
            'status'       => $restaurant->status,
            'category_id'  => $restaurant->category_id,
            'description'  => $restaurant->description,
            'logo_url'     => $restaurant->logo_url,
        ];
    }
}
