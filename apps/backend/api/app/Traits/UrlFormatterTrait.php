<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait UrlFormatterTrait
{
    /**
     * Format a database image path/URL to a full public URL dynamically based on the current request.
     */
    protected function formatImageUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        // If it's already an external absolute URL, return it as is
        if (preg_match('/^https?:\/\//', $value)) {
            $path = parse_url($value, PHP_URL_PATH);
            if ($path && str_contains($path, '/storage/')) {
                // It's a local storage file path wrapped in a full URL, extract the relative part
                $value = ltrim($path, '/');
            } else {
                return $value;
            }
        }

        $path = ltrim($value, '/');

        // Prepend storage/ if it's not there
        if (!str_starts_with($path, 'storage/')) {
            $path = 'storage/' . $path;
        }

        $baseUrl = rtrim(config('app.url'), '/');

        return "{$baseUrl}/{$path}";
    }
}
