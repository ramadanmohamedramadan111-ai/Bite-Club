<?php

namespace App\Services\Domain\Loyalty;

use App\Models\User;
use App\Models\Wallet;
use App\Models\PointTransaction;
use App\Enums\Loyalty\PointTransactionTypeEnum;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Exception;

class WalletDomainService
{
    public function getBalance(int $userId): int
    {
        $wallet = Wallet::where('user_id', $userId)->first();
        return $wallet ? $wallet->balance : 0;
    }

    public function earnPoints(int $userId, int $points, string $source, ?int $refId = null, ?string $refType = null): PointTransaction
    {
        if ($points <= 0) {
            throw new \InvalidArgumentException('Earned points must be positive.');
        }

        return DB::transaction(function () use ($userId, $points, $source, $refId, $refType) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $userId],
                ['balance' => 0]
            );

            // Row-level lock to prevent race conditions
            $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();

            $wallet->balance += $points;
            $wallet->save();

            return PointTransaction::create([
                'wallet_id'      => $wallet->id,
                'points'         => $points,
                'type'           => PointTransactionTypeEnum::EARN->value,
                'source'         => $source,
                'reference_id'   => $refId,
                'reference_type' => $refType,
            ]);
        });
    }

    public function redeemPoints(int $userId, int $points, string $source, ?int $refId = null, ?string $refType = null): PointTransaction
    {
        if ($points <= 0) {
            throw new \InvalidArgumentException('Redeemed points must be positive.');
        }

        return DB::transaction(function () use ($userId, $points, $source, $refId, $refType) {
            $wallet = Wallet::where('user_id', $userId)->lockForUpdate()->first();

            if (!$wallet || $wallet->balance < $points) {
                throw new Exception(trans('loyalty.insufficient_points') ?? 'Insufficient points.');
            }

            $wallet->balance -= $points;
            $wallet->save();

            return PointTransaction::create([
                'wallet_id'      => $wallet->id,
                'points'         => -$points,
                'type'           => PointTransactionTypeEnum::REDEEM->value,
                'source'         => $source,
                'reference_id'   => $refId,
                'reference_type' => $refType,
            ]);
        });
    }

    public function getTransactions(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        $wallet = Wallet::where('user_id', $userId)->first();
        if (!$wallet) {
            return PointTransaction::whereRaw('1 = 0')->paginate($perPage);
        }

        return PointTransaction::where('wallet_id', $wallet->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
