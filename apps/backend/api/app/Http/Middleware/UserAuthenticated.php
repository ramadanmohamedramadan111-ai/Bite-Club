<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Symfony\Component\HttpFoundation\Response;

class UserAuthenticated
{
    use ApiResponseTrait;

    private function guard(): JWTGuard
    {
        return Auth::guard('user');
    }

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $user = $this->guard()->user();

            if (!$user instanceof User) {
                throw new Exception();
            }

        } catch (Exception) {
            return $this->unauthorizedResponse(
                trans('auth.unauthorized')
            );
        }

        return $next($request);
    }
}