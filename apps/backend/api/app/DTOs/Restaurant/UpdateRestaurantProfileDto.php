<?php

namespace App\DTOs\Restaurant;

use App\Http\Requests\Restaurant\UpdateRestaurantProfileRequest;
use Illuminate\Http\UploadedFile;

class UpdateRestaurantProfileDto
{
    public function __construct(
        private int $restaurantId,
        private ?string $name,
        private ?string $description,
        private ?string $phoneNumber,
        private ?string $address,
        private ?int $categoryId,
        private ?UploadedFile $logo,
        private ?UploadedFile $coverImage
    ) {}

    public static function fromValidatedRequest(UpdateRestaurantProfileRequest $request): self
    {
        $data = $request->validated();

        return new self(
            (int) $data['restaurant_id'],
            $data['name'] ?? null,
            $data['description'] ?? null,
            $data['phone_number'] ?? null,
            $data['address'] ?? null,
            isset($data['category_id']) ? (int) $data['category_id'] : null,
            $request->file('logo'),
            $request->file('cover_image')
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function getCategoryId(): ?int
    {
        return $this->categoryId;
    }

    public function getLogo(): ?UploadedFile
    {
        return $this->logo;
    }

    public function getCoverImage(): ?UploadedFile
    {
        return $this->coverImage;
    }

    public function toArray(): array
    {
        $data = [];
        if (!is_null($this->name)) $data['name'] = $this->name;
        if (!is_null($this->description)) $data['description'] = $this->description;
        if (!is_null($this->phoneNumber)) $data['phone_number'] = $this->phoneNumber;
        if (!is_null($this->address)) $data['address'] = $this->address;
        if (!is_null($this->categoryId)) $data['category_id'] = $this->categoryId;
        return $data;
    }
}
