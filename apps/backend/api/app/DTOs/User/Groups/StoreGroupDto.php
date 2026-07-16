<?php

namespace App\DTOs\User\Groups;

use App\Http\Requests\User\Groups\StoreGroupRequest;
use Illuminate\Http\UploadedFile;

class StoreGroupDto
{
    private string $name;
    private ?string $description;
    private ?UploadedFile $image;
    private bool $allowJoinByLink;

    public function __construct(string $name, ?string $description = null, ?UploadedFile $image = null, bool $allowJoinByLink = true)
    {
        $this->name = $name;
        $this->description = $description;
        $this->image = $image;
        $this->allowJoinByLink = $allowJoinByLink;
    }

    public static function fromValidatedRequest(StoreGroupRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $data['name'],
            $data['description'] ?? null,
            $request->file('image'),
            isset($data['allow_join_by_link']) ? filter_var($data['allow_join_by_link'], FILTER_VALIDATE_BOOLEAN) : true
        );
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getImage(): ?UploadedFile
    {
        return $this->image;
    }

    public function getAllowJoinByLink(): bool
    {
        return $this->allowJoinByLink;
    }

    public function toArray(): array
    {
        return [
            'name'               => $this->name,
            'description'        => $this->description,
            'allow_join_by_link' => $this->allowJoinByLink,
        ];
    }
}
