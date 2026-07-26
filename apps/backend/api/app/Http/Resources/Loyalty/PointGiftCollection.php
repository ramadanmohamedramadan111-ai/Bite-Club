<?php

namespace App\Http\Resources\Loyalty;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PointGiftCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'items' => PointGiftResource::collection($this->collection),
            'meta'  => [
                'current_page' => $this->resource->currentPage(),
                'per_page'     => $this->resource->perPage(),
                'total'        => $this->resource->total(),
                'last_page'    => $this->resource->lastPage(),
            ],
        ];
    }
}
