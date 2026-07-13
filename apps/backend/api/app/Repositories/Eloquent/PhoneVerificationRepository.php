<?php

namespace App\Repositories\Eloquent;

use App\Models\PhoneVerification;
use App\Repositories\Interfaces\PhoneVerificationRepositoryInterface;

class PhoneVerificationRepository extends BaseRepository implements PhoneVerificationRepositoryInterface
{
    public function __construct(PhoneVerification $model)
    {
        parent::__construct($model);
    }

    public function findLatestByPhoneNumber(string $phoneNumber): ?PhoneVerification
    {
        return $this->query()
            ->where('phone_number', $phoneNumber)
            ->latest()
            ->first();
    }

    public function deleteByPhoneNumber(string $phoneNumber): void
    {
        $this->query()
            ->where('phone_number', $phoneNumber)
            ->delete();
    }
}
