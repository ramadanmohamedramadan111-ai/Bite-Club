<?php

namespace App\DTOs\RestaurantSetting;

use App\Http\Requests\RestaurantSetting\UpdateRestaurantSettingRequest;

class UpdateRestaurantSettingDto
{
    private int $restaurantId;
    private ?bool $isOpen;
    private ?bool $acceptOrders;
    private ?bool $deliveryEnabled;
    private ?bool $pickupEnabled;
    private ?float $latitude;
    private ?float $longitude;
    private ?float $deliveryRadius;
    private ?float $deliveryFeePerKm;
    private ?float $depositThreshold;
    private ?float $depositPercentage;

    public function __construct(
        int $restaurantId,
        ?bool $isOpen = null,
        ?bool $acceptOrders = null,
        ?bool $deliveryEnabled = null,
        ?bool $pickupEnabled = null,
        ?float $latitude = null,
        ?float $longitude = null,
        ?float $deliveryRadius = null,
        ?float $deliveryFeePerKm = null,
        ?float $depositThreshold = null,
        ?float $depositPercentage = null
    ) {
        $this->restaurantId = $restaurantId;
        $this->isOpen = $isOpen;
        $this->acceptOrders = $acceptOrders;
        $this->deliveryEnabled = $deliveryEnabled;
        $this->pickupEnabled = $pickupEnabled;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->deliveryRadius = $deliveryRadius;
        $this->deliveryFeePerKm = $deliveryFeePerKm;
        $this->depositThreshold = $depositThreshold;
        $this->depositPercentage = $depositPercentage;
    }

    public static function fromValidatedRequest(UpdateRestaurantSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['restaurant_id'],
            isset($data['is_open']) ? (bool) $data['is_open'] : null,
            isset($data['accept_orders']) ? (bool) $data['accept_orders'] : null,
            isset($data['delivery_enabled']) ? (bool) $data['delivery_enabled'] : null,
            isset($data['pickup_enabled']) ? (bool) $data['pickup_enabled'] : null,
            isset($data['latitude']) ? (float) $data['latitude'] : null,
            isset($data['longitude']) ? (float) $data['longitude'] : null,
            isset($data['delivery_radius']) ? (float) $data['delivery_radius'] : null,
            isset($data['delivery_fee_per_km']) ? (float) $data['delivery_fee_per_km'] : null,
            isset($data['deposit_threshold']) ? (float) $data['deposit_threshold'] : null,
            isset($data['deposit_percentage']) ? (float) $data['deposit_percentage'] : null
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function toArray(): array
    {
        $data = [];
        if (!is_null($this->isOpen)) $data['is_open'] = $this->isOpen;
        if (!is_null($this->acceptOrders)) $data['accept_orders'] = $this->acceptOrders;
        if (!is_null($this->deliveryEnabled)) $data['delivery_enabled'] = $this->deliveryEnabled;
        if (!is_null($this->pickupEnabled)) $data['pickup_enabled'] = $this->pickupEnabled;
        if (!is_null($this->latitude)) $data['latitude'] = $this->latitude;
        if (!is_null($this->longitude)) $data['longitude'] = $this->longitude;
        if (!is_null($this->deliveryRadius)) $data['delivery_radius'] = $this->deliveryRadius;
        if (!is_null($this->deliveryFeePerKm)) $data['delivery_fee_per_km'] = $this->deliveryFeePerKm;
        if (!is_null($this->depositThreshold)) $data['deposit_threshold'] = $this->depositThreshold;
        if (!is_null($this->depositPercentage)) $data['deposit_percentage'] = $this->depositPercentage;
        return $data;
    }
}
