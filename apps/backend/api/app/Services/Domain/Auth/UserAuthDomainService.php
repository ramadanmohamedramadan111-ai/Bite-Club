<?php

namespace App\Services\Domain\Auth;

use Exception;
use App\Models\User;
use Illuminate\Support\Str;
use App\DTOs\Auth\UserRegisterDto;
use App\DTOs\Auth\ForgotPasswordDto;
use App\DTOs\Auth\VerifyResetOtpDto;
use App\DTOs\Auth\ResetPasswordDto;
use Illuminate\Support\Facades\Hash;
use App\Enums\Auth\UserStatusEnum;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Interfaces\PasswordResetOtpRepositoryInterface;
use App\Services\Infrastructure\Mail\PasswordResetEmailService;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use App\Services\Infrastructure\Mail\EmailVerificationService;

class UserAuthDomainService
{
    public function __construct(
        private UserRepositoryInterface             $userRepository,
        private EmailVerificationService            $emailVerificationService,
        private PasswordResetOtpRepositoryInterface $passwordResetOtpRepository,
        private PasswordResetEmailService           $passwordResetEmailService,
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

        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            $user = $this->userRepository->create([
                'first_name'          => $dto->getFirstName(),
                'last_name'           => $dto->getLastName(),
                'date_of_birth'       => $dto->getDateOfBirth(),
                'username'            => $dto->getUsername(),
                'email'               => $dto->getEmail(),
                'phone_number'        => $this->normalizePhoneNumber($dto->getPhoneNumber()),
                'password_hash'       => Hash::make($dto->getPassword()),
                'gender'              => $dto->getGender(),
                'firebase_uid'        => null,
                'referral_code'       => $this->generateReferralCode($dto->getUsername()),
                'referred_by'         => $referredBy,
                'failed_pickup_count' => 0,
                'status'              => UserStatusEnum::PENDING,
                'email_verified_at'   => null,
                'last_login_at'       => null,
            ]);

            $this->emailVerificationService->sendVerificationEmail($user);

            \Illuminate\Support\Facades\DB::commit();

            return $user;
        } catch (Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            throw $e;
        }
    }

    public function verifyEmail(int $id, string $hash, bool $hasValidSignature): User
    {
        if (!$hasValidSignature) {
            throw new Exception('Invalid or expired signature.');
        }

        $user = $this->userRepository->find($id);

        if (!$user) {
            throw new Exception('User not found.');
        }

        if (!hash_equals((string) $hash, sha1($user->email))) {
            throw new Exception('Invalid signature hash.');
        }

        if ($user->status === UserStatusEnum::ACTIVE) {
            return $user;
        }

        $this->userRepository->update($user->id, [
            'status'            => UserStatusEnum::ACTIVE,
            'email_verified_at' => now(),
        ]);

        return $user;
    }

    public function sendPasswordResetOtp(ForgotPasswordDto $dto): void
    {
        $email = $dto->getEmail();
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw new Exception('User not found.');
        }

        // Invalidate previous OTPs
        while ($record = $this->passwordResetOtpRepository->first(['email' => $email])) {
            $this->passwordResetOtpRepository->delete($record->id);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpHash = Hash::make($otp);

        $this->passwordResetOtpRepository->create([
            'email'       => $email,
            'otp_hash'    => $otpHash,
            'is_verified' => false,
            'expires_at'  => now()->addMinutes(10),
            'attempts'    => 0,
        ]);

        $this->passwordResetEmailService->sendOtpEmail($email, $otp);
    }

    public function verifyPasswordResetOtp(VerifyResetOtpDto $dto): void
    {
        $email = $dto->getEmail();
        $record = $this->passwordResetOtpRepository->first(['email' => $email]);

        if (!$record) {
            throw new Exception('OTP code is invalid or expired.');
        }

        if (now()->greaterThan($record->expires_at)) {
            $this->passwordResetOtpRepository->delete($record->id);
            throw new Exception('OTP code has expired.');
        }

        if ($record->attempts >= 5) {
            $this->passwordResetOtpRepository->delete($record->id);
            throw new Exception('Too many failed attempts. Please request a new OTP.');
        }

        if (!Hash::check($dto->getOtp(), $record->otp_hash)) {
            $this->passwordResetOtpRepository->update($record->id, [
                'attempts' => $record->attempts + 1,
            ]);
            throw new Exception('Invalid OTP code.');
        }

        $this->passwordResetOtpRepository->update($record->id, [
            'is_verified' => true,
        ]);
    }

    public function resetPassword(ResetPasswordDto $dto): void
    {
        $email = $dto->getEmail();
        $record = $this->passwordResetOtpRepository->first(['email' => $email]);

        if (!$record || !$record->is_verified) {
            throw new Exception('Password reset request is invalid or expired.');
        }

        if (now()->greaterThan($record->expires_at)) {
            $this->passwordResetOtpRepository->delete($record->id);
            throw new Exception('Password reset request has expired.');
        }

        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw new Exception('User not found.');
        }

        $this->userRepository->update($user->id, [
            'password_hash' => Hash::make($dto->getPassword()),
        ]);

        $this->passwordResetOtpRepository->delete($record->id);
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

        if ($user->status === UserStatusEnum::PENDING) {
            $this->guard()->logout();
            throw new Exception('Please verify your email first.');
        }

        if (!$user->isActive()) {
            $this->guard()->logout();
            throw new Exception(trans('auth.inactive'));
        }

        return $token;
    }

    public function login(User $user): string
    {
        return $this->guard()->login($user);
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
