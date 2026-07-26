<?php

namespace App\Services\Domain\Loyalty;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Friendship;
use App\Models\PointGift;
use App\Models\PointTransaction;
use App\Enums\Loyalty\PointTransactionTypeEnum;
use App\Enums\Loyalty\PointTransactionSourceEnum;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Exception;

class PointGiftDomainService
{
    public function giftPoints(int $senderId, int $receiverId, int $points, ?string $note = null): PointGift
    {
        if ($points <= 0) {
            throw new Exception('Points must be greater than zero.', 400);
        }

        if ($points < 10) {
            throw new Exception('Minimum gift: 10 points.', 400);
        }

        if ($senderId === $receiverId) {
            throw new Exception('Sender cannot gift points to himself.', 400);
        }

        $receiver = User::find($receiverId);
        if (!$receiver) {
            throw new Exception('Receiver must exist.', 404);
        }

        $lowId = min($senderId, $receiverId);
        $highId = max($senderId, $receiverId);
        $friendshipExists = Friendship::where('user_low_id', $lowId)
            ->where('user_high_id', $highId)
            ->exists();

        if (!$friendshipExists) {
            throw new Exception('Users are not friends.', 403);
        }

        return DB::transaction(function () use ($senderId, $receiverId, $points, $note, $receiver) {
            $senderWallet = Wallet::where('user_id', $senderId)->lockForUpdate()->first();
            if (!$senderWallet || $senderWallet->balance < $points) {
                throw new Exception('Insufficient points.', 400);
            }

            $receiverWallet = Wallet::firstOrCreate(
                ['user_id' => $receiverId],
                ['balance' => 0]
            );
            $receiverWallet = Wallet::where('id', $receiverWallet->id)->lockForUpdate()->first();

            $pointGift = PointGift::create([
                'sender_user_id'   => $senderId,
                'receiver_user_id' => $receiverId,
                'points'           => $points,
                'note'             => $note,
            ]);

            $senderWallet->balance -= $points;
            $senderWallet->save();

            $receiverWallet->balance += $points;
            $receiverWallet->save();

            $senderUser = User::find($senderId);

            PointTransaction::create([
                'wallet_id'      => $senderWallet->id,
                'points'         => -$points,
                'type'           => PointTransactionTypeEnum::GIFT_SENT->value,
                'source'         => PointTransactionSourceEnum::POINT_GIFT->value,
                'reference_id'   => $pointGift->id,
                'reference_type' => PointGift::class,
                'description'    => "Gifted {$points} points to {$receiver->full_name}",
            ]);

            PointTransaction::create([
                'wallet_id'      => $receiverWallet->id,
                'points'         => $points,
                'type'           => PointTransactionTypeEnum::GIFT_RECEIVED->value,
                'source'         => PointTransactionSourceEnum::POINT_GIFT->value,
                'reference_id'   => $pointGift->id,
                'reference_type' => PointGift::class,
                'description'    => "Received {$points} points from {$senderUser->full_name}",
            ]);

            return $pointGift;
        });
    }

    public function getGiftHistory(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return PointGift::with(['sender', 'receiver'])
            ->where(function ($query) use ($userId) {
                $query->where('sender_user_id', $userId)
                      ->orWhere('receiver_user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getAcceptedFriends(int $userId): Collection
    {
        $user = User::find($userId);
        if (!$user) {
            return collect();
        }
        return $user->friends;
    }
}
