<?php

namespace App\Services\Application\Loyalty;

use App\Services\Domain\Loyalty\PointGiftDomainService;
use App\DTOs\User\Wallet\GiftPointsDto;
use App\Models\PointGift;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PointGiftApplicationService
{
    public function __construct(
        private readonly PointGiftDomainService $pointGiftDomainService
    ) {}

    public function giftPoints(int $senderId, GiftPointsDto $dto): PointGift
    {
        return $this->pointGiftDomainService->giftPoints(
            $senderId,
            $dto->getReceiverId(),
            $dto->getPoints(),
            $dto->getNote()
        );
    }

    public function getGiftHistory(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->pointGiftDomainService->getGiftHistory($userId, $perPage);
    }

    public function getAcceptedFriends(int $userId): Collection
    {
        return $this->pointGiftDomainService->getAcceptedFriends($userId);
    }
}
