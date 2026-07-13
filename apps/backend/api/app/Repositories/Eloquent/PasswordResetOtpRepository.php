<?php

namespace App\Repositories\Eloquent;

use App\Models\PasswordResetOtp;
use App\Repositories\Interfaces\PasswordResetOtpRepositoryInterface;

class PasswordResetOtpRepository extends BaseRepository implements PasswordResetOtpRepositoryInterface
{
    public function __construct(PasswordResetOtp $model)
    {
        parent::__construct($model);
    }
}
