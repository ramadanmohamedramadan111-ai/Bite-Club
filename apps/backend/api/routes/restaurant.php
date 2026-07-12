<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\RestaurantAuthController;



Route::post('/register', [RestaurantAuthController::class, 'register'])->name('register');
Route::post('/login',    [RestaurantAuthController::class, 'login'])->name('login');

Route::middleware('auth.restaurant')->group(function () {
    Route::post('/logout',  [RestaurantAuthController::class, 'logout'])->name('logout');
    Route::post('/refresh', [RestaurantAuthController::class, 'refresh'])->name('refresh');
    Route::get('/me',       [RestaurantAuthController::class, 'me'])->name('me');
});
