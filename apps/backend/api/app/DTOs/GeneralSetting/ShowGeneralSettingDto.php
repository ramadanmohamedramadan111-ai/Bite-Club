<?php

namespace App\DTOs\GeneralSetting;

use App\Http\Requests\GeneralSetting\ShowGeneralSettingRequest;

class ShowGeneralSettingDto
{
    private int $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public static function fromValidatedRequest(ShowGeneralSettingRequest $request): self
    {
        return new self((int) $request->route('id'));
    }

    public function getId(): int
    {
        return $this->id;
    }
}
