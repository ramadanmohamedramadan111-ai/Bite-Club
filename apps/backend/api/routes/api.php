<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\Auth\UserAuthController;
use App\Http\Controllers\Api\RestaurantCategoryController;

//user auth
Route::prefix('user')->name('user.')->group(function () {

    Route::post('/register', [UserAuthController::class, 'register'])->name('register');
    Route::post('/login', [UserAuthController::class, 'login'])->name('login');

    Route::middleware('auth.user')->group(function () {

        Route::post('/logout', [UserAuthController::class, 'logout'])->name('logout');

        Route::post('/refresh', [UserAuthController::class, 'refresh'])->name('refresh');

        Route::get('/me', [UserAuthController::class, 'me'])->name('me');
    });

});
