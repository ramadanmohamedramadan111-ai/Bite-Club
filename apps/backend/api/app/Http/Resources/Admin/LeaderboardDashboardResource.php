<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardDashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'summary' => [
                'total_posts'        => (int) $this['summary']['total_posts'],
                'total_copies'       => (int) $this['summary']['total_copies'],
                'active_users'       => (int) $this['summary']['active_users'],
                'active_restaurants' => (int) $this['summary']['active_restaurants'],
            ],
            'top_posts'       => AdminDashboardPostResource::collection($this['top_posts']),
            'top_restaurants' => $this['top_restaurants']->map(fn ($r) => [
                'id'           => $r->id,
                'name'         => $r->name,
                'posts_count'  => (int) $r->posts_count,
                'total_copies' => (int) $r->total_copies,
            ]),
        ];
    }
}
