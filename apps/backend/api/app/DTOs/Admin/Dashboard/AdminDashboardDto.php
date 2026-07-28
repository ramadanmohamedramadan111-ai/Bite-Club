<?php

namespace App\DTOs\Admin\Dashboard;

use App\Http\Requests\Admin\Dashboard\AdminDashboardRequest;

class AdminDashboardDto
{
    private string $period;

    public function __construct(string $period)
    {
        $this->period = $period;
    }

    public static function fromValidatedRequest(AdminDashboardRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['period'] ?? 'month'
        );
    }

    public function getPeriod(): string
    {
        return $this->period;
    }
}
