<?php

namespace App\Http\Resources\Admin\Dashboard;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'stats' => [
                'total_revenue'       => (float) $this['stats']['total_revenue'],
                'total_orders'        => (int) $this['stats']['total_orders'],
                'new_users'           => (int) $this['stats']['new_users'],
                'pending_restaurants' => (int) $this['stats']['pending_restaurants'],
            ],
            'recent_orders'   => $this['recent_orders'],
            'recent_activity' => $this['recent_activity'],
        ];
    }
}
