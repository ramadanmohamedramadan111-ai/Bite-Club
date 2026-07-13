<?php

namespace App\Services\Application\Auth;

use App\DTOs\RestaurantAuth\ForgotPasswordDto;
use App\DTOs\RestaurantAuth\ResetPasswordDto;
use App\Services\Domain\Auth\RestaurantPasswordResetDomainService;

class RestaurantPasswordResetApplicationService
{
    public function __construct(
        private RestaurantPasswordResetDomainService $domainService
    ) {}

    public function forgotPassword(ForgotPasswordDto $dto): string
    {
        return $this->domainService->sendResetLink($dto->getEmail());
    }

    public function resetPassword(ResetPasswordDto $dto): string
    {
        return $this->domainService->resetPassword(
            $dto->getEmail(),
            $dto->getToken(),
            $dto->getPassword()
        );
    }
}
