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
        $this->syncPendingReferralsForUser($order->user_id);
    }

    public function syncPendingReferralsForUser(int $userId): void
    {
        $pendingReferrals = Referral::where(function ($query) use ($userId) {
            $query->where('referrer_id', $userId)
                  ->orWhere('referred_id', $userId);
        })->where('status', ReferralStatusEnum::PENDING->value)->get();

        foreach ($pendingReferrals as $referral) {
            $hasCompletedOrder = Order::where('user_id', $referral->referred_id)
                ->where('status', OrderStatusEnum::COMPLETED->value)
                ->exists();

            if ($hasCompletedOrder) {
                DB::transaction(function () use ($referral) {
                    $lockedReferral = Referral::where('id', $referral->id)->lockForUpdate()->first();
                    
                    if ($lockedReferral && ($lockedReferral->status->value === ReferralStatusEnum::PENDING->value || $lockedReferral->status === ReferralStatusEnum::PENDING)) {
                        $lockedReferral->update([
                            'status'       => ReferralStatusEnum::COMPLETED->value,
                            'completed_at' => now(),
                        ]);

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
    }

    public function getReferrals(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        $this->syncPendingReferralsForUser($userId);

        return Referral::with('referred')
            ->where('referrer_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
