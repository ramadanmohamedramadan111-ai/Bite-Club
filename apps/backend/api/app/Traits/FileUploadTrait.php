<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait FileUploadTrait
{
    /**
     * Upload a file to a specific disk and folder, returns the relative URL/path starting with 'storage/'.
     */
    protected function uploadFile(UploadedFile $file, string $folder = 'images', string $disk = 'public'): string
    {
        $path = $file->store($folder, $disk);
        return "storage/" . $path;
    }

    /**
     * Delete a file from the disk based on its relative path or public URL.
     */
    protected function deleteFile(?string $fileUrl, string $disk = 'public'): void
    {
        if (!$fileUrl) {
            return;
        }

        if (str_starts_with($fileUrl, 'http://') || str_starts_with($fileUrl, 'https://')) {
            $urlPath = parse_url($fileUrl, PHP_URL_PATH);
        } else {
            $urlPath = $fileUrl;
        }
        
        if ($urlPath) {
            $path = ltrim($urlPath, '/');
            if (str_starts_with($path, 'storage/')) {
                $path = substr($path, 8);
            }
            
            if (Storage::disk($disk)->exists($path)) {
                Storage::disk($disk)->delete($path);
            }
        }
    }
}
