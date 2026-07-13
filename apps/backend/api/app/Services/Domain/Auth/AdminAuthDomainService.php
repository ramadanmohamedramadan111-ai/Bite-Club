<?php

namespace App\Services\Domain\Auth;

use Exception;
use App\Models\Admin;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class AdminAuthDomainService
{
    private function guard(): JWTGuard
    {
        return Auth::guard('admin');
    }

    public function attemptLogin(string $email, string $password): string
    {
        $token = $this->guard()->attempt([
            'email'    => $email,
            'password' => $password,
        ]);

        if (!$token) {
            throw new Exception(trans('auth.failed'));
        }

        $admin = $this->getAuthenticatedAdmin();

        if (!$admin->isActive()) {
            $this->guard()->logout();
            throw new Exception(trans('auth.inactive'));
        }

        return $token;
    }

    public function logout(): void
    {
        $this->guard()->logout();
    }

    public function refresh(): string
    {
        $token = $this->guard()->refresh();

        if (!$token) {
            throw new Exception(trans('auth.refresh_failed'));
        }

        return $token;
    }

    public function getAuthenticatedAdmin(): Admin
    {
        $admin = $this->guard()->user();

        if (!$admin instanceof Admin) {
            throw new Exception(trans('auth.unauthorized'));
        }

        return $admin;
    }
}
