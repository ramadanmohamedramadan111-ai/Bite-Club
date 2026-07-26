<?php

namespace App\DTOs\User\Wallet;

use App\Http\Requests\User\Wallet\GiftPointsRequest;

class GiftPointsDto
{
    private int $receiverId;
    private int $points;
    private ?string $note;

    public function __construct(int $receiverId, int $points, ?string $note = null)
    {
        $this->receiverId = $receiverId;
        $this->points     = $points;
        $this->note       = $note;
    }

    public static function fromValidatedRequest(GiftPointsRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['receiver_id'],
            (int) $data['points'],
            $data['note'] ?? null
        );
    }

    public function getReceiverId(): int
    {
        return $this->receiverId;
    }

    public function getPoints(): int
    {
        return $this->points;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function toArray(): array
    {
        return [
            'receiver_id' => $this->receiverId,
            'points'      => $this->points,
            'note'        => $this->note,
        ];
    }
}
