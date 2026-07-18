<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class RestaurantOpeningHourResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'day_of_week' => (int) $this->day_of_week,
            'opens_at'    => $this->opens_at ? Carbon::parse($this->opens_at)->format('H:i') : null,
            'closes_at'   => $this->closes_at ? Carbon::parse($this->closes_at)->format('H:i') : null,
            'is_closed'   => (bool) $this->is_closed,
        ];
    }
}
