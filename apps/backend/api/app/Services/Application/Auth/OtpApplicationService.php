<?php

namespace App\Services\Application\Auth;

use Exception;
use App\Enums\Auth\UserStatusEnum;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Domain\Auth\UserAuthDomainService;
use App\Services\Domain\Auth\OtpDomainService;

class OtpApplicationService
{
    public function __construct(
        private OtpDomainService        $otpDomainService,
        private UserRepositoryInterface $userRepository,
        private UserAuthDomainService   $userAuthDomainService,
    ) {}

    public function sendOtp(string $phoneNumber): void
    {
        $this->otpDomainService
            ->sendOtp($phoneNumber);
    }

    public function verifyOtp(
        string $phoneNumber,
        string $otp
    ): array {

        $this->otpDomainService
            ->verifyOtp(
                $phoneNumber,
                $otp
            );

        $normalizedPhone = $this->normalizePhoneNumber($phoneNumber);
        $user = $this->userRepository->findByPhoneNumber($normalizedPhone);

        if (!$user) {
            throw new Exception('User not found.');
        }

        if ($user->status !== UserStatusEnum::PENDING) {
            throw new Exception('User status is not pending.');
        }

        $this->userRepository->update($user->id, [
            'status'            => UserStatusEnum::ACTIVE,
            'phone_verified_at' => now(),
        ]);

        $token = $this->userAuthDomainService->login($user);

        $this->userRepository->updateLastLogin($user->id);

        return [
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl') * 60,
            'user'         => [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'date_of_birth' => $user->date_of_birth ? $user->date_of_birth->format('Y-m-d') : null,
                'username'      => $user->username,
                'email'         => $user->email,
                'phone_number'  => $user->phone_number,
                'referral_code' => $user->referral_code,
            ],
        ];
    }

    public function resendOtp(string $phoneNumber): void
    {
        $normalizedPhone = $this->normalizePhoneNumber($phoneNumber);
        $user = $this->userRepository->findByPhoneNumber($normalizedPhone);

        if (!$user) {
            throw new Exception('User not found.');
        }

        if ($user->status === UserStatusEnum::ACTIVE) {
            throw new Exception('User is already active.');
        }

        if ($user->status === UserStatusEnum::PENDING) {
            $this->otpDomainService->sendOtp($phoneNumber);
        }
    }

    private function normalizePhoneNumber(string $phoneNumber): string
    {
        if (str_starts_with($phoneNumber, '+20')) {
            return '0' . substr($phoneNumber, 3);
        }
        if (str_starts_with($phoneNumber, '+2')) {
            return substr($phoneNumber, 2);
        }
        return $phoneNumber;
    }
}
