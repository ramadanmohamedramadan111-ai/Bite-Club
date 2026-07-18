<?php

namespace App\DTOs\RestaurantOpeningHour;

class RestaurantOpeningHourDto
{
    public function __construct(
        private int $dayOfWeek,
        private ?string $opensAt,
        private ?string $closesAt,
        private bool $isClosed
    ) {}

    public function getDayOfWeek(): int
    {
        return $this->dayOfWeek;
    }

    public function getOpensAt(): ?string
    {
        return $this->opensAt;
    }

    public function getClosesAt(): ?string
    {
        return $this->closesAt;
    }

    public function getIsClosed(): bool
    {
        return $this->isClosed;
    }
}
