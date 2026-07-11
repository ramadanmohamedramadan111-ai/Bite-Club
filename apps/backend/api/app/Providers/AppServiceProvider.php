<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\AdminRepositoryInterface;
use App\Repositories\Eloquent\AdminRepository;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;
use App\Repositories\Eloquent\RestaurantCategoryRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            AdminRepositoryInterface::class,
            AdminRepository::class
        );

        $this->app->bind(
            RestaurantCategoryRepositoryInterface::class,
            RestaurantCategoryRepository::class
        );
    }

    public function boot(): void
    {
    }
}
