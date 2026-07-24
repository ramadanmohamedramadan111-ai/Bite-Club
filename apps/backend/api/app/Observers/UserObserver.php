<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Referral;
use App\Enums\Loyalty\ReferralStatusEnum;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Every user has exactly one Wallet
        $user->wallet()->create([
            'balance' => 0,
        ]);

        // If registered using a referral code
        if ($user->referred_by) {
            Referral::create([
                'referrer_id' => $user->referred_by,
                'referred_id' => $user->id,
                'status'      => ReferralStatusEnum::PENDING->value,
            ]);
        }
    }
}
