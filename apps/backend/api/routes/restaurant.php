<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\RestaurantAuthController;
use App\Http\Controllers\Api\RestaurantSettingController;
use App\Http\Controllers\Api\Auth\RestaurantPasswordResetController;
use App\Http\Controllers\Api\RestaurantCategoryController;

Route::post('/register', [RestaurantAuthController::class, 'register'])->name('register');
Route::post('/login',    [RestaurantAuthController::class, 'login'])->name('login');

Route::post('/forgot-password', [RestaurantPasswordResetController::class, 'forgotPassword'])->name('password.email');
Route::post('/reset-password', [RestaurantPasswordResetController::class, 'resetPassword'])->name('password.update');
Route::get('/categories', [RestaurantCategoryController::class, 'index'])->name('categories.index');

Route::middleware('auth.restaurant')->group(function () {
    Route::post('/logout',  [RestaurantAuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [RestaurantAuthController::class, 'refresh'])->name('refresh');
    Route::get('/me',       [RestaurantAuthController::class, 'me'])->name('me');

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [RestaurantSettingController::class, 'index'])->name('index');
        Route::get('/{id}', [RestaurantSettingController::class, 'show'])->name('show');
        Route::post('/', [RestaurantSettingController::class, 'store'])->name('store');
        Route::put('/{id}', [RestaurantSettingController::class, 'update'])->name('update');
    });
});
