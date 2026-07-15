<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait FileUploadTrait
{
    /**
     * Upload a file to a specific disk and folder, returns the public URL.
     */
    protected function uploadFile(UploadedFile $file, string $folder = 'images', string $disk = 'public'): string
    {
        $path = $file->store($folder, $disk);
        return Storage::disk($disk)->url($path);
    }

    /**
     * Delete a file from the disk based on its public URL.
     */
    protected function deleteFile(?string $fileUrl, string $disk = 'public'): void
    {
        if (!$fileUrl) {
            return;
        }

        // Assuming the URL looks like http://domain.com/storage/images/file.png
        $urlPath = parse_url($fileUrl, PHP_URL_PATH);
        
        if ($urlPath) {
            // Remove the typical /storage/ prefix to get the actual path in the public disk
            $path = str_replace('/storage/', '', $urlPath);
            
            if (Storage::disk($disk)->exists($path)) {
                Storage::disk($disk)->delete($path);
            }
        }
    }
}
