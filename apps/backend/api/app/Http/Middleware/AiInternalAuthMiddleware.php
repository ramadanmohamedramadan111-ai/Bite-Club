<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponseTrait;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AiInternalAuthMiddleware
{
    use ApiResponseTrait;

    public function handle(Request $request, Closure $next): Response
    {
        $configuredKey = config('services.ai.internal_api_key');
        $providedKey = $request->header('X-Internal-API-Key');

        if (!$configuredKey || !$providedKey || !hash_equals($configuredKey, $providedKey)) {
            return $this->unauthorizedResponse('Invalid internal API key');
        }

        return $next($request);
    }
}
