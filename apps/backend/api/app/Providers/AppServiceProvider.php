<?php

namespace App\Providers;

use App\Models\Restaurant;
use App\Models\RestaurantReview;
use App\Observers\RestaurantObserver;
use App\Observers\RestaurantReviewObserver;
use App\Repositories\Eloquent\AdminRepository;
use App\Repositories\Eloquent\CartItemRepository;
use App\Repositories\Eloquent\CartRepository;
use App\Repositories\Eloquent\GroupOrderRepository;
use App\Repositories\Eloquent\GroupOrderItemRepository;
use App\Repositories\Eloquent\GeneralSettingRepository;
use App\Repositories\Eloquent\MenuCategoryRepository;
use App\Repositories\Eloquent\MenuItemRepository;
use App\Repositories\Eloquent\OrderItemRepository;
use App\Repositories\Eloquent\OrderPaymentRepository;
use App\Repositories\Eloquent\OrderRepository;
use App\Repositories\Eloquent\PasswordResetOtpRepository;
use App\Repositories\Eloquent\RestaurantCategoryRepository;
use App\Repositories\Eloquent\RestaurantOpeningHourRepository;
use App\Repositories\Eloquent\RestaurantRepository;
use App\Repositories\Eloquent\RestaurantReviewRepository;
use App\Repositories\Eloquent\RestaurantSettingRepository;
use App\Repositories\Eloquent\User\FriendRequestRepository;
use App\Repositories\Eloquent\User\FriendshipRepository;
use App\Repositories\Eloquent\User\GroupMemberRepository;
use App\Repositories\Eloquent\User\GroupRepository;
use App\Repositories\Eloquent\UserBanRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Interfaces\AdminRepositoryInterface;
use App\Repositories\Interfaces\CartItemRepositoryInterface;
use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Repositories\Interfaces\GroupOrderItemRepositoryInterface;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;
use App\Repositories\Interfaces\MenuCategoryRepositoryInterface;
use App\Repositories\Interfaces\MenuItemRepositoryInterface;
use App\Repositories\Interfaces\OrderItemRepositoryInterface;
use App\Repositories\Interfaces\OrderPaymentRepositoryInterface;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\PasswordResetOtpRepositoryInterface;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;
use App\Repositories\Interfaces\RestaurantOpeningHourRepositoryInterface;

use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use App\Repositories\Interfaces\RestaurantReviewRepositoryInterface;
use App\Repositories\Interfaces\RestaurantSettingRepositoryInterface;
use App\Repositories\Interfaces\User\FriendRequestRepositoryInterface;
use App\Repositories\Interfaces\User\FriendshipRepositoryInterface;
use App\Repositories\Interfaces\User\GroupMemberRepositoryInterface;
use App\Repositories\Interfaces\User\GroupRepositoryInterface;
use App\Repositories\Interfaces\UserBanRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\Infrastructure\Payment\KashierPaymentGateway;
use App\Services\Infrastructure\Payment\PaymentGatewayInterface;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            AdminRepositoryInterface::class,
            AdminRepository::class
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );



        $this->app->bind(
            UserBanRepositoryInterface::class,
            UserBanRepository::class
        );



        $this->app->bind(
            RestaurantCategoryRepositoryInterface::class,
            RestaurantCategoryRepository::class
        );

        $this->app->bind(
            RestaurantRepositoryInterface::class,
            RestaurantRepository::class
        );

        $this->app->bind(
            PasswordResetOtpRepositoryInterface::class,
            PasswordResetOtpRepository::class
        );

        $this->app->bind(
            RestaurantSettingRepositoryInterface::class,
            RestaurantSettingRepository::class
        );



        $this->app->bind(
            RestaurantOpeningHourRepositoryInterface::class,
            RestaurantOpeningHourRepository::class
        );



        $this->app->bind(
            GeneralSettingRepositoryInterface::class,
            GeneralSettingRepository::class
        );

        $this->app->bind(
            FriendRequestRepositoryInterface::class,
            FriendRequestRepository::class
        );

        $this->app->bind(
            FriendshipRepositoryInterface::class,
            FriendshipRepository::class
        );


        $this->app->bind(
            MenuCategoryRepositoryInterface::class,
            MenuCategoryRepository::class
        );

        $this->app->bind(
            MenuItemRepositoryInterface::class,
            MenuItemRepository::class
        );

        $this->app->bind(
            RestaurantReviewRepositoryInterface::class,
            RestaurantReviewRepository::class
        );



        $this->app->bind(
            GroupRepositoryInterface::class,
            GroupRepository::class
        );

        $this->app->bind(
            GroupMemberRepositoryInterface::class,
            GroupMemberRepository::class
        );

        $this->app->bind(CartRepositoryInterface::class, CartRepository::class);
        $this->app->bind(CartItemRepositoryInterface::class, CartItemRepository::class);
        $this->app->bind(GroupOrderRepositoryInterface::class, GroupOrderRepository::class);
        $this->app->bind(GroupOrderItemRepositoryInterface::class, GroupOrderItemRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->bind(OrderItemRepositoryInterface::class, OrderItemRepository::class);
        $this->app->bind(OrderPaymentRepositoryInterface::class, OrderPaymentRepository::class);
        $this->app->bind(PaymentGatewayInterface::class, KashierPaymentGateway::class);
    }

    public function boot(): void
    {
        Restaurant::observe(RestaurantObserver::class);
        RestaurantReview::observe(RestaurantReviewObserver::class);
    }
}
