<?php

namespace App\Services\Domain\Restaurant\Support;

use App\Enums\Restaurant\RestaurantStatusEnum;
use DomainException;

class RestaurantStatusTransition
{
    private static function transitions(): array
    {
        return [
            RestaurantStatusEnum::PENDING_APPROVAL->value => [
                RestaurantStatusEnum::ACTIVE->value,
                RestaurantStatusEnum::REJECTED->value,
            ],
            RestaurantStatusEnum::ACTIVE->value => [
                RestaurantStatusEnum::SUSPENDED->value,
                RestaurantStatusEnum::CLOSED->value,
            ],
            RestaurantStatusEnum::SUSPENDED->value => [
                RestaurantStatusEnum::ACTIVE->value,
                RestaurantStatusEnum::CLOSED->value,
            ],
            RestaurantStatusEnum::CLOSED->value => [
                RestaurantStatusEnum::ACTIVE->value,
            ],
            RestaurantStatusEnum::REJECTED->value => [
                RestaurantStatusEnum::ACTIVE->value,
            ],
        ];
    }

    public static function can(
        RestaurantStatusEnum $from,
        RestaurantStatusEnum $to
    ): bool {
        return in_array(
            $to->value,
            self::transitions()[$from->value] ?? [],
            true
        );
    }

    public static function assert(
        RestaurantStatusEnum $from,
        RestaurantStatusEnum $to
    ): void {
        if (!self::can($from, $to)) {
            throw new DomainException(
                "Cannot change restaurant status from {$from->value} to {$to->value}."
            );
        }
    }
}
