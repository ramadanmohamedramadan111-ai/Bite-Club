<?php

namespace App\Services\Domain\User;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserDomainService
{
    public function searchUsers(?string $search = null): array
    {
        $query = User::query();

        if ($search) {
            $search = strtolower($search);
            $query->where(function ($q) use ($search) {
                $q->where('username', 'LIKE', "%{$search}%")
                  ->orWhere('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%{$search}%");
            });
        }

        // Exclude the current user from search results if authenticated
        if (Auth::guard('user')->check()) {
            $query->where('id', '!=', Auth::guard('user')->id());
        }

        return $query->get()->all();
    }
}
