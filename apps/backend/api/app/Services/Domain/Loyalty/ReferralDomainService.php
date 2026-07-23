<?php

namespace App\Services\Domain\Loyalty;

use App\Models\Referral;
use App\Models\Order;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Loyalty\ReferralStatusEnum;
use App\Enums\Loyalty\PointTransactionSourceEnum;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReferralDomainService
{
    public function __construct(
        private readonly WalletDomainService $walletService
    ) {}

    public function handleReferredUserFirstOrder(Order $order): void
    {
        // Check if there is a pending referral record for the referred user
        $referral = Referral::where('referred_id', $order->user_id)
            ->where('status', ReferralStatusEnum::PENDING->value)
            ->first();

        if (!$referral) {
            return;
        }

        // Check if this is the user's first completed order
        $completedCount = Order::where('user_id', $order->user_id)
            ->where('status', OrderStatusEnum::COMPLETED->value)
            ->count();

        if ($completedCount >= 1) {
            DB::transaction(function () use ($referral) {
                // Lock referral for update to prevent concurrent updates
                $lockedReferral = Referral::where('id', $referral->id)->lockForUpdate()->first();
                
                if ($lockedReferral->status->value === ReferralStatusEnum::PENDING->value || $lockedReferral->status === ReferralStatusEnum::PENDING) {
                    $lockedReferral->update([
                        'status'       => ReferralStatusEnum::COMPLETED->value,
                        'completed_at' => now(),
                    ]);

                    // Referrer earns 100 points
                    $this->walletService->earnPoints(
                        $lockedReferral->referrer_id,
                        100,
                        PointTransactionSourceEnum::REFERRAL->value,
                        $lockedReferral->id,
                        Referral::class
                    );
                }
            });
        }
    }

    public function getReferrals(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Referral::with('referred')
            ->where('referrer_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
