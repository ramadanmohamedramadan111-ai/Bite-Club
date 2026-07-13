<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use App\Models\Admin;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthenticated
{
    use ApiResponseTrait;

    private function guard(): JWTGuard
    {
        return Auth::guard('admin');
    }

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $admin = $this->guard()->user();

            if (!$admin instanceof Admin) {
                throw new Exception();
            }

        } catch (Exception) {
            return $this->unauthorizedResponse(trans('auth.unauthorized'));
        }

        return $next($request);
    }
}
