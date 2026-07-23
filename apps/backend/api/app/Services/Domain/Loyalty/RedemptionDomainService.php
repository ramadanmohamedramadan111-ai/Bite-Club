<?php

namespace App\Services\Domain\Loyalty;

use App\Models\Redemption;
use App\Models\Order;
use App\Enums\Loyalty\PointTransactionSourceEnum;
use Illuminate\Support\Facades\DB;
use Exception;

class RedemptionDomainService
{
    public function __construct(
        private readonly WalletDomainService $walletService
    ) {}

    public function redeem(int $userId, int $orderId, int $points): Redemption
    {
        $order = Order::findOrFail($orderId);

        if ($order->user_id !== $userId) {
            throw new Exception(trans('loyalty.order_owner_mismatch') ?? 'You can only redeem points for your own orders.');
        }

        // Restrictions:
        // 1. User cannot redeem more points than wallet balance
        $balance = $this->walletService->getBalance($userId);
        if ($points > $balance) {
            throw new Exception(trans('loyalty.insufficient_points') ?? 'Insufficient points.');
        }

        // 2. Discount amount cannot exceed order total
        $discountAmount = $points * 0.1;
        if ($discountAmount > $order->total) {
            throw new Exception(trans('loyalty.discount_exceeds_total') ?? 'Discount amount cannot exceed order total.');
        }

        return DB::transaction(function () use ($userId, $orderId, $points, $discountAmount) {
            $redemption = Redemption::create([
                'user_id'         => $userId,
                'order_id'        => $orderId,
                'points_redeemed' => $points,
                'discount_amount' => $discountAmount,
            ]);

            // Deduct points from wallet
            $this->walletService->redeemPoints(
                $userId,
                $points,
                PointTransactionSourceEnum::REDEMPTION->value,
                $redemption->id,
                Redemption::class
            );

            return $redemption;
        });
    }
}
