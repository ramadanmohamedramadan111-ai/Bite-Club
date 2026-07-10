<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AdminAuthController;

Route::prefix('admin')->name('admin.')->group(function () {

    Route::post('/login', [AdminAuthController::class, 'login'])->name('login');

    Route::middleware('auth.admin')->group(function () {
        Route::post('/logout',  [AdminAuthController::class, 'logout'])->name('logout');
        Route::post('/refresh', [AdminAuthController::class, 'refresh'])->name('refresh');
        Route::get('/me',       [AdminAuthController::class, 'me'])->name('me');
    });

});
