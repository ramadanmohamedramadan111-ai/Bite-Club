<?php

namespace App\DTOs\User\Groups;

use App\Http\Requests\User\Groups\UpdateGroupRequest;
use Illuminate\Http\UploadedFile;

class UpdateGroupDto
{
    private ?string $name;
    private ?string $description;
    private ?UploadedFile $image;
    private ?bool $allowJoinByLink;

    public function __construct(?string $name = null, ?string $description = null, ?UploadedFile $image = null, ?bool $allowJoinByLink = null)
    {
        $this->name = $name;
        $this->description = $description;
        $this->image = $image;
        $this->allowJoinByLink = $allowJoinByLink;
    }

    public static function fromValidatedRequest(UpdateGroupRequest $request): self
    {
        $data = $request->validated();
        return new self(
            $data['name'] ?? null,
            $data['description'] ?? null,
            $request->file('image'),
            isset($data['allow_join_by_link']) ? filter_var($data['allow_join_by_link'], FILTER_VALIDATE_BOOLEAN) : null
        );
    }

    public function getName(): ?string
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

    public function getAllowJoinByLink(): ?bool
    {
        return $this->allowJoinByLink;
    }

    public function toArray(): array
    {
        $arr = [];
        if ($this->name !== null) {
            $arr['name'] = $this->name;
        }
        if ($this->description !== null) {
            $arr['description'] = $this->description;
        }
        if ($this->allowJoinByLink !== null) {
            $arr['allow_join_by_link'] = $this->allowJoinByLink;
        }
        return $arr;
    }
}
