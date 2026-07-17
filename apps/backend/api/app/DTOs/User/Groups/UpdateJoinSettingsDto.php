<?php

namespace App\DTOs\User\Groups;

use App\Http\Requests\User\Groups\UpdateJoinSettingsRequest;

class UpdateJoinSettingsDto
{
    private bool $allowJoinByLink;

    public function __construct(bool $allowJoinByLink)
    {
        $this->allowJoinByLink = $allowJoinByLink;
    }

    public static function fromValidatedRequest(UpdateJoinSettingsRequest $request): self
    {
        $data = $request->validated();
        return new self(
            filter_var($data['allow_join_by_link'], FILTER_VALIDATE_BOOLEAN)
        );
    }

    public function getAllowJoinByLink(): bool
    {
        return $this->allowJoinByLink;
    }
}
