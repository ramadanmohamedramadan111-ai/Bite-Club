<?php

namespace App\Services\Application\Auth;

use App\DTOs\Auth\UserLoginDto;
use App\DTOs\Auth\UserRegisterDto;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Domain\Auth\UserAuthDomainService;

class UserAuthApplicationService
{
    public function __construct(
        private UserAuthDomainService   $userAuthDomainService,
        private UserRepositoryInterface $userRepository
    ) {}

    public function register(UserRegisterDto $dto): void
    {
        $this->userAuthDomainService->register($dto);
    }

    public function login(UserLoginDto $dto): array
    {
        $token = $this->userAuthDomainService->attemptLogin(
            $dto->getEmail(),
            $dto->getPassword()
        );

        $user = $this->userAuthDomainService->getAuthenticatedUser();

        $this->userRepository->updateLastLogin($user->id);

        return $this->buildTokenResponse($token, [
            'id'            => $user->id,
            'first_name'   => $user->first_name,
            'last_name'    => $user->last_name,
            'date_of_birth' => $user->date_of_birth,
            'username'      => $user->username,
            'email'         => $user->email,
            'phone_number'  => $user->phone_number,
            'referral_code' => $user->referral_code,
        ]);
    }

    public function logout(): void
    {
        $this->userAuthDomainService->logout();
    }

    public function refresh(): array
    {
        $token = $this->userAuthDomainService->refresh();

        return $this->buildTokenResponse($token);
    }

    public function me(): array
    {
        $user = $this->userAuthDomainService->getAuthenticatedUser();

        return [
            'id'             => $user->id,
            'first_name'   => $user->first_name,
            'last_name'    => $user->last_name,
            'date_of_birth' => $user->date_of_birth,
            'username'       => $user->username,
            'email'          => $user->email,
            'phone_number'   => $user->phone_number,
            'profile_image'  => $user->profile_image_url,
            'gender'         => $user->gender,
            'status'         => $user->status,
            'referral_code'  => $user->referral_code,
            'last_login_at'  => $user->last_login_at,
        ];
    }

    private function buildTokenResponse(string $token, ?array $user = null): array
    {
        $response = [
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl') * 60,
        ];

        if ($user !== null) {
            $response['user'] = $user;
        }

        return $response;
    }
}
