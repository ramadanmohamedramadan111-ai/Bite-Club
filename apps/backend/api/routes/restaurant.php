<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\RestaurantAuthController;
use App\Http\Controllers\Api\Auth\RestaurantPasswordResetController;


Route::post('/register', [RestaurantAuthController::class, 'register'])->name('register');
Route::post('/login',    [RestaurantAuthController::class, 'login'])->name('login');


Route::post('/forgot-password', [RestaurantPasswordResetController::class, 'forgotPassword'])->name('password.email');
Route::post('/reset-password', [RestaurantPasswordResetController::class, 'resetPassword'])->name('password.update');


Route::middleware('auth.restaurant')->group(function () {
    Route::post('/logout',  [RestaurantAuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [RestaurantAuthController::class, 'refresh'])->name('refresh');
    Route::get('/me',       [RestaurantAuthController::class, 'me'])->name('me');
});
