<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use App\Models\Restaurant;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Symfony\Component\HttpFoundation\Response;

class RestaurantAuthenticated
{
    use ApiResponseTrait;

    private function guard(): JWTGuard
    {
        return Auth::guard('restaurant');
    }

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $restaurant = $this->guard()->user();

            if (!$restaurant instanceof Restaurant) {
                throw new Exception();
            }

        } catch (Exception) {
            return $this->unauthorizedResponse(trans('restaurant_auth.unauthorized'));
        }

        return $next($request);
    }
}
