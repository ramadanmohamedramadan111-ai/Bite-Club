<?php

namespace App\Repositories\Interfaces;

use App\Models\PhoneVerification;

interface PhoneVerificationRepositoryInterface extends BaseRepositoryInterface
{
    public function findLatestByPhoneNumber(string $phoneNumber): ?PhoneVerification;

    public function deleteByPhoneNumber(string $phoneNumber): void;
}
