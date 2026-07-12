<?php

namespace App\Services\Domain\Auth;

use Exception;
use App\Models\User;
use Illuminate\Support\Str;
use App\DTOs\Auth\UserRegisterDto;
use Illuminate\Support\Facades\Hash;
use App\Enums\Auth\UserStatusEnum;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class UserAuthDomainService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    private function guard(): JWTGuard
    {
        return Auth::guard('user');
    }

    public function register(UserRegisterDto $dto): User
    {
        $referredBy = null;

        if ($dto->getReferrerCode()) {

            $referrer = $this->userRepository
                ->findByReferralCode($dto->getReferrerCode());

            if (!$referrer) {
                throw new Exception(trans('auth.invalid_referral_code'));
            }

            $referredBy = $referrer->id;
        }

        return $this->userRepository->create([
            'first_name' => $dto->getFirstName(),
            'last_name' => $dto->getLastName(),
            'date_of_birth' => $dto->getDateOfBirth(),
            'username'             => $dto->getUsername(),
            'email'                => $dto->getEmail(),
            'phone_number'         => $dto->getPhoneNumber(),
            'password_hash'        => Hash::make($dto->getPassword()),
            'gender'               => $dto->getGender(),
            'firebase_uid'         => null,
            'referral_code'        => $this->generateReferralCode($dto->getUsername()),
            'referred_by'          => $referredBy,
            'failed_pickup_count'  => 0,
            'status'               => UserStatusEnum::ACTIVE,
            'last_login_at'        => null,
        ]);
    }

    public function attemptLogin(string $email, string $password): string
    {
        $token = $this->guard()->attempt([
            'email'    => $email,
            'password' => $password,
        ]);

        if (!$token) {
            throw new Exception(trans('auth.failed'));
        }

        $user = $this->getAuthenticatedUser();

        if (!$user->isActive()) {
            $this->guard()->logout();
            throw new Exception(trans('auth.inactive'));
        }

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
            throw new Exception(trans('auth.refresh_failed'));
        }

        return $token;
    }

    public function getAuthenticatedUser(): User
    {
        $user = $this->guard()->user();

        if (!$user instanceof User) {
            throw new Exception(trans('auth.unauthorized'));
        }

        return $user;
    }

    private function generateReferralCode(string $username): string
    {
        $prefix = strtoupper(substr($username, 0, 3));

        do {
            $code = $prefix . strtoupper(Str::random(5));
        } while ($this->userRepository->findByReferralCode($code));

        return $code;
    }
}
