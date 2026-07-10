<?php

namespace App\Services\Application\Auth;

use App\DTOs\Auth\AdminLoginDto;
use App\Repositories\Interfaces\AdminRepositoryInterface;
use App\Services\Domain\Auth\AdminAuthDomainService;

class AdminAuthApplicationService
{
    public function __construct(
        private AdminAuthDomainService   $adminAuthDomainService,
        private AdminRepositoryInterface $adminRepository
    ) {}

    public function login(AdminLoginDto $dto): array
    {
        $token = $this->adminAuthDomainService->attemptLogin(
            $dto->getEmail(),
            $dto->getPassword()
        );

        $admin = $this->adminAuthDomainService->getAuthenticatedAdmin();

        $this->adminRepository->updateLastLogin($admin->id);

        return $this->buildTokenResponse($token);
    }

    public function logout(): void
    {
        $this->adminAuthDomainService->logout();
    }

    public function refresh(): array
    {
        $token = $this->adminAuthDomainService->refresh();

        return $this->buildTokenResponse($token);
    }

    public function me(): array
    {
        $admin = $this->adminAuthDomainService->getAuthenticatedAdmin();

        return [
            'id'            => $admin->id,
            'name'          => $admin->name,
            'email'         => $admin->email,
            'status'        => $admin->status,
            'last_login_at' => $admin->last_login_at,
        ];
    }

    private function buildTokenResponse(string $token): array
    {
        return [
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl') * 60,
        ];
    }
}
